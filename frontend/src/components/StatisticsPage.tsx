import axios from 'axios';
import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SaleItem {
  _id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  sold: boolean;
  dateOfSale: string;
}

interface TotalSales {
  totalSaleOfTheMonth: number;
  numberOfSoldItems: number;
  soldItems: SaleItem[];
  numberOfUnsoldItems: number;
  unsoldItems: SaleItem[];
}

interface BarChartData {
  priceRange: string;
  count: number;
}

interface StatisticsPageProps {
  month: string;
}
const baseURL= import.meta.env.VITE_BASE_URL

export const StatisticsPage = ({ month }: StatisticsPageProps) => {
  const [monthSalesData, setMonthSalesData] = useState<TotalSales | null>(null);
  const [barChart, setBarChart] = useState<BarChartData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (month === "All Months") return;

    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}statistics/combined?month=${month}`);
        const data = response.data.data;
        setMonthSalesData(data.totalSales);
        setBarChart(data.barChart || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load statistics. Please try again later.");
      }
    };

    fetchData();
  }, [month]);

  if (month === "All Months") {
    return (
      <p className="text-center text-lg font-medium text-gray-700">
        No sales data displayed for All Months.
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-lg font-medium text-red-500">
        {error}
      </p>
    );
  }

  const barChartData = {
    labels: barChart.map((data) => data.priceRange),
    datasets: [
      {
        label: "Items Sold",
        data: barChart.map((data) => data.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Sales by Price Range for ${month}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg border-l-4 border-yellow-400">
      {monthSalesData ? (
        <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-6">
          <div className="lg:w-1/3 space-y-5">
            <div className="text-xl font-semibold text-gray-800">{month.toUpperCase()}: ${monthSalesData.totalSaleOfTheMonth}</div>
            <div className="text-xl font-semibold text-gray-800">Total sold items: {monthSalesData.numberOfSoldItems}</div>
            <div className="text-xl font-semibold text-gray-800">Number of unsold items: {monthSalesData.numberOfUnsoldItems}</div>
          </div>
          <div>
            <Bar data={barChartData} options={options} />
          </div>
        </div>
      ) : (
        <p className="text-center text-lg font-medium text-gray-700">
          Loading sales data...
        </p>
      )}
    </div>
  );
};
