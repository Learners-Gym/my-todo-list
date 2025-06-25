import React from 'react';
import { FilterStatus } from '../types';

interface FilterTabsProps {
  currentFilter: FilterStatus;
  onSetFilter: (filter: FilterStatus) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ currentFilter, onSetFilter }) => {
  const filters: { label: string; value: FilterStatus }[] = [
    { label: 'すべて', value: FilterStatus.ALL },
    { label: 'アクティブ', value: FilterStatus.ACTIVE },
    { label: '完了済み', value: FilterStatus.COMPLETED },
  ];

  return (
    <div className="flex justify-center space-x-2 sm:space-x-4 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onSetFilter(filter.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${currentFilter === filter.value
              ? 'bg-custom-sky-500 text-white'
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;