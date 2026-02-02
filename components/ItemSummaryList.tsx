import React from 'react';
import { Expense } from '../types';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface ItemSummaryListProps {
    expenses: Expense[];
    onSelectItem: (itemName: string) => void;
}

const ItemSummaryList: React.FC<ItemSummaryListProps> = ({ expenses, onSelectItem }) => {
    // FIX: Replaced the generic type argument on `.reduce` with a type assertion on the
    // initial value (`{}`). The generic argument syntax `<...>` can conflict with JSX parsing in .tsx files.
    // This change resolves the parsing error and correctly types `itemTotals`.
    const itemTotals = expenses.reduce((acc, expense) => {
        if (expense.items) {
            expense.items.forEach(item => {
                const itemNameKey = item.name.trim().toLowerCase();
                if (!itemNameKey) return;

                if (!acc[itemNameKey]) {
                    acc[itemNameKey] = { total: 0, originalName: item.name.trim() };
                }
                acc[itemNameKey].total += item.price;
            });
        }
        return acc;
    }, {} as Record<string, { total: number, originalName: string }>);

    const sortedItems = Object.entries(itemTotals).sort(([, a], [, b]) => b.total - a.total);

    if (sortedItems.length === 0) {
        return (
          <div className="text-center py-12 px-4 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold text-white">No Itemized Expenses</h3>
            <p className="text-gray-400 mt-2">Add expenses with individual items to see analysis here.</p>
          </div>
        );
      }

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Expenses by Item</h2>
            <div className="space-y-3">
                {sortedItems.map(([itemNameKey, data]) => (
                    <button
                        key={itemNameKey}
                        onClick={() => onSelectItem(itemNameKey)}
                        className="w-full text-left bg-gray-800 p-4 rounded-lg flex items-center justify-between shadow-md hover:bg-gray-700/50 transition-colors"
                    >
                        <span className="font-semibold text-white capitalize">{data.originalName}</span>
                        <div className="flex items-center space-x-3">
                            <span className="font-bold text-lg text-white">₹{data.total.toFixed(2)}</span>
                            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ItemSummaryList;