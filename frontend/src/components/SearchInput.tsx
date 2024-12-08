import React from 'react';

interface SearchInputProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange }) => {
    return (
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder="Search transactions"
            className="p-2 border rounded mb-4 font-semibold"
        />
    );
};

export default SearchInput;
