import React, { useState, useEffect } from 'react';

type Transaction = {
    _id: string;
    title: string;
    image: string;
    description: string;
    price: number;
    category: string;
    sold: boolean;
    dateOfSale: string;
};

type Props = {
    transactions: Transaction[];
};

const TransactionTable: React.FC<Props> = ({ transactions }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 1000); 
    }, []);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = 'https://via.placeholder.com/64';
    };

    if (loading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-black">
                <thead>
                    <tr className="bg-yellow-400 text-black">
                        <th className="border border-black px-4 py-2">ID</th>
                        <th className="border border-black px-4 py-2">Title</th>
                        <th className="border border-black px-4 py-2">Description</th>
                        <th className="border border-black px-4 py-2">Price</th>
                        <th className="border border-black px-4 py-2">Category</th>
                        <th className="border border-black px-4 py-2">Sold</th>
                        <th className="border border-black px-4 py-2">Image</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction, index) => (
                        <tr
                            key={transaction._id}
                            className={`text-center ${index % 2 === 0 ? 'bg-gray-100' : ''}`}
                        >
                            <td className="border border-black px-4 py-2">{transaction._id}</td>
                            <td className="border border-black px-4 py-2">{transaction.title}</td>
                            <td className="border border-black px-4 py-2">{transaction.description}</td>
                            <td className="border border-black px-4 py-2">${transaction.price}</td>
                            <td className="border border-black px-4 py-2">{transaction.category}</td>
                            <td className="border border-black px-4 py-2">{transaction.sold ? "Yes" : "No"}</td>
                            <td className="border border-black px-4 py-2">
                                <img
                                    src={transaction.image}
                                    alt="Transaction"
                                    className="w-16 h-16 object-cover"
                                    onError={handleImageError}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionTable;
