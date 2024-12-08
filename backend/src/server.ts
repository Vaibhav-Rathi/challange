import express, {Request, Response} from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import axios from 'axios';
import cors from 'cors';
import Transaction from './database/schema'
const app = express();
const PORT = 3000;
dotenv.config();
app.use(express.json());

app.use(cors({ origin: "http://localhost:5173" }));

const monthMapping: { [key: string]: number } = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12
};

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.log(dbUrl);
  console.error('DATABASE_URL is not defined');
  process.exit(1);
}

mongoose.connect(dbUrl, {
    serverSelectionTimeoutMS : 30000
})
  .catch((error) => {
    console.error('Error connecting to the database', error);
  });

app.post('/enterData', async (req, res) => {
  try {
    const response = await axios.get("https://s3.amazonaws.com/roxiler.com/product_transaction.json");
    const productTransactions = response.data;

    const result = await Transaction.insertMany(productTransactions);

    res.status(200).json({
      message: "Data successfully saved to the database",
      result
    });
  } catch (error) {
    console.error('Error fetching or saving data:', error);
    res.status(500).json({ message: 'Error fetching or saving data' });
  }
});

app.get('/transactions', async (req, res) => {
  try {
    const search = req.query.search as string || '';
    const month = req.query.month as string || 'All Months';
    const page = parseInt(req.query.page as string) || 1;
    const perPage = 10;

    const query: Record<string, any> = {};

    if (search) {
      const numericSearch = parseFloat(search);

      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        ...(isNaN(numericSearch) ? [] : [{ price: numericSearch }]),
      ];
    }

    if (month !== 'All Months') {
      const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1;
      query.$expr = { $eq: [{ $month: '$dateOfSale' }, monthNumber] };
    }

    const skip = (page - 1) * perPage;

    const transactions = await Transaction.find(query)
      .skip(skip)
      .limit(perPage);

    const totalRecords = await Transaction.countDocuments(query);

    res.status(200).json({
      message: 'Transactions fetched successfully',
      data: transactions,
      pagination: {
        totalRecords,
        currentPage: page,
        perPage,
        totalPages: Math.ceil(totalRecords / perPage),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});


app.get('/statistics', async (req: Request, res: Response): Promise<void> => {
  try {
    const monthParam = req.query.month as string;

    const month = /^\d+$/.test(monthParam)
      ? parseInt(monthParam, 10) 
      : monthMapping[monthParam.toLowerCase()]; 

    if (!month || month < 1 || month > 12) {
      res.status(400).json({ error: "Please provide a valid 'month' parameter (e.g., 'January' or '1')." });
      return;
    }
    const soldItems = await Transaction.find({
      sold: true,
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, month]
      }
    });

    const totalSaleOfTheMonth = soldItems
      .map(item => item.price) 
      .reduce((sum, price) => sum + price, 0);

    const unsoldItems = await Transaction.find({
      sold: false,
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, month]
      }
    });

    const numberOfSoldItems = soldItems.length;
    const numberOfUnsoldItems = unsoldItems.length;

    res.status(200).json({
      data : {
        totalSaleOfTheMonth,
        numberOfSoldItems,
        soldItems, 
        numberOfUnsoldItems,
        unsoldItems,
      }
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "An error occurred while fetching statistics." });
  }
});


app.get('/statistics/bar-chart', async (req:Request, res:Response): Promise<void> =>{
  try {
    const monthParam = req.query.month as string;

    const month = /^\d+$/.test(monthParam)
      ? parseInt(monthParam, 10) 
      : monthMapping[monthParam.toLowerCase()]; 

    if (!month || month < 1 || month > 12) {
      res.status(400).json({ error: "Please provide a valid 'month' parameter (e.g., 'January' or '1')." });
      return;
    }

    const allItems = await Transaction.find({
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, month]
      }
    });

    const priceRanges = [
      { min: 0, max: 100, label: "0-100" },
      { min: 101, max: 200, label: "101-200" },
      { min: 201, max: 300, label: "201-300" },
      { min: 301, max: 400, label: "301-400" },
      { min: 401, max: 500, label: "401-500" },
      { min: 501, max: 600, label: "501-600" },
      { min: 601, max: 700, label: "601-700" },
      { min: 701, max: 800, label: "701-800" },
      { min: 801, max: 900, label: "801-900" },
      { min: 901, max: Infinity, label: "901-above" }
    ];

    const counts = priceRanges.map(range => ({
      priceRange: range.label,
      count: 0
    }));

    allItems.forEach(item => {
      const price = item.price;

      priceRanges.forEach(range => {
        if (price >= range.min && price <= range.max) {
          const rangeIndex = counts.findIndex(count => count.priceRange === range.label);
          if (rangeIndex !== -1) {
            counts[rangeIndex].count += 1;
          }
        }
      });
    });
    res.status(200).json({
      data: counts
    });

  }catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "An error occurred while fetching statistics." });
  }
});


app.get('/statistics/bar-chart/categories', async (req: Request, res: Response): Promise<void> =>{
    try {
      const monthParam = req.query.month as string;
  
      const month = /^\d+$/.test(monthParam)
        ? parseInt(monthParam, 10) 
        : monthMapping[monthParam.toLowerCase()]; 
  
      if (!month || month < 1 || month > 12) {
        res.status(400).json({ error: "Please provide a valid 'month' parameter (e.g., 'January' or '1')." });
        return;
      }
  
      const allItems = await Transaction.find({
        $expr: {
          $eq: [{ $month: "$dateOfSale" }, month]
        }
      });
  
      const categoryCount: { [category: string]: number } = {};
  
      allItems.forEach((item: any) => {
        const category = item.category;
  
        if (categoryCount[category]) {
          categoryCount[category]++;
        } else {
          categoryCount[category] = 1;
        }
      });
  
      const pieChartData = Object.keys(categoryCount).map(category => ({
        category,
        count: categoryCount[category]
      }));
  
      res.status(200).json({
        data: pieChartData
      });
  
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ error: "An error occurred while fetching statistics." });
    }
});

app.get('/statistics/combined', async (req: Request, res: Response): Promise<void> => {
  try {
    const monthParam = req.query.month as string;

    const month = /^\d+$/.test(monthParam)
      ? parseInt(monthParam, 10)
      : monthMapping[monthParam.toLowerCase()];

    if (!month || month < 1 || month > 12) {
      res.status(400).json({ error: "Please provide a valid 'month' parameter (e.g., 'January' or '1')." });
      return;
    }

    const baseUrl = process.env.BASE_URL; 

    if (!baseUrl) {
      res.status(500).json({ error: "BASE_URL is not defined in .env file." });
      return;
    }

    const [totalSalesResponse, barChartResponse, pieChartResponse] = await Promise.all([
      axios.get(`${baseUrl}/statistics?month=${month}`),
      axios.get(`${baseUrl}/statistics/bar-chart?month=${month}`),
      axios.get(`${baseUrl}/statistics/bar-chart/categories?month=${month}`)
    ]);

    const combinedResponse = {
      data: {
        totalSales: totalSalesResponse.data.data,
        barChart: barChartResponse.data.data,
        pieChart: pieChartResponse.data.data
      }
    };

    res.status(200).json(combinedResponse);

  } catch (error) {
    console.error("Error fetching combined statistics:", error);
    res.status(500).json({ error: "An error occurred while fetching combined statistics." });
  }
});


export {mongoose};
app.listen(PORT);