import React from 'react';

type PaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
    return (
        <div className='flex space-x-28 mt-5 text-2xl'>
            <div className='bg-slate-300 p-2 rounded-lg shadow-lg'>
                Page No: {page}/{totalPages}
            </div>
            <button
                className={`bg-slate-300 p-2 rounded-lg shadow-lg ${
                    page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-400'
                }`}
                onClick={() => {
                    if (page > 1) onPageChange(page - 1);
                }}
                disabled={page === 1}
            >
                Previous
            </button>

            <button
                className={`bg-slate-300 p-2 rounded-lg shadow-lg ${
                    page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-400'
                }`}
                onClick={() => {
                    if (page < totalPages) onPageChange(page + 1);
                }}
                disabled={page === totalPages}
            >
                Next
            </button>
            <div className='bg-slate-300 p-2 rounded-lg shadow-lg'>Per Page: 10</div>
        </div>
    );
};

export default Pagination;
