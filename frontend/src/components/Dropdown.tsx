import React from 'react';

type DropdownProps = {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    isDropdownOpen: boolean;
    toggleDropdown: () => void;
};

const Dropdown: React.FC<DropdownProps> = ({
    selectedCategory,
    onSelectCategory,
    isDropdownOpen,
    toggleDropdown,
}) => {
    const months = [
        'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="relative inline-block text-left">
            <div className='text-2xl font-semibold'>Select Month</div>
            <button
                className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={toggleDropdown}
            >
                {selectedCategory}
            </button>
            {isDropdownOpen && (
                <ul className="absolute mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    {months.map((month) => (
                        <li
                            key={month}
                            className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                                onSelectCategory(month);
                            }}
                        >
                            {month}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dropdown;
