import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionTable from './TransactionTable';
import Pagination from './Pagination';
import Dropdown from './Dropdown';
import SearchInput from './SearchInput';
import {StatisticsPage} from './StatisticsPage';


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

type Pagination = {
    totalRecords: number;
    currentPage: number;
    perPage: number;
    totalPages: number;
};

type CombinedStatistics = {
    totalTransactions: number;
    totalSales: number;
    totalRevenue: number;
};

const baseURL = import.meta.env.VITE_BASE_URL
console.log('Base URL:', baseURL);

export const TransactionsList: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('March');
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [combinedStatistics, setCombinedStatistics] = useState<CombinedStatistics | null>(null);

    useEffect(() => {
        axios.get(`${baseURL}transactions?page=${page}&search=${searchQuery}&month=${selectedCategory}`)
            .then((response) => {
                const data: Transaction[] = response.data.data;
                const pageData: Pagination = response.data.pagination;
                setTransactions(data);
                setPagination(pageData);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setError("Failed to fetch transactions.");
                setLoading(false);
            });
        
        if (selectedCategory !== "All Months") {
            axios.get(`${baseURL}statistics/combined?month=${selectedCategory}`)
                .then((response) => {
                    setCombinedStatistics(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching statistics:", error);
                });
        }
    }, [page, searchQuery, selectedCategory]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value); 
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-6">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold bg-white rounded-full mx-auto p-7 shadow-lg">
                    Transaction Dashboard
                </h1>
            </div>

            <div className="mb-4 space-x-96">
                <SearchInput value={searchQuery} onChange={handleSearchChange} />
                <Dropdown
                    selectedCategory={selectedCategory}
                    onSelectCategory={(category) => setSelectedCategory(category)}
                    isDropdownOpen={isDropdownOpen}
                    toggleDropdown={() => setIsDropdownOpen(!isDropdownOpen)}
                />
            </div>

            <div className="mb-4">
                {selectedCategory !== "All Months" && combinedStatistics && (
                    <div className="bg-white p-4 rounded-md shadow-md">
                        <StatisticsPage month={selectedCategory.toLowerCase()} />
                    </div>
                )}
            </div>

            <TransactionTable transactions={transactions} />

            {pagination && (
                <Pagination
                    page={page}
                    totalPages={pagination.totalPages}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
};

export default TransactionsList;
