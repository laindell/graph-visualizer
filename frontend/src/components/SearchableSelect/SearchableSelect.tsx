import React, { useState, useMemo } from 'react';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  label: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  label,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSelect = (option: string) => {
    onChange(option);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 whitespace-nowrap">
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          value={isOpen ? searchTerm : (value || '')}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {isOpen && !disabled && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => {
                setIsOpen(false);
                setSearchTerm('');
              }}
            />
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
              {!value && (
                <div
                  onClick={() => handleSelect('')}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-gray-500 dark:text-gray-400 italic"
                >
                  {placeholder}
                </div>
              )}

              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                  Не знайдено
                </div>
              ) : (
                filteredOptions.map(option => (
                  <div
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={`px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer ${
                      value === option ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {option}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
