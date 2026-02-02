import React from 'react';
import { Expense, ExpenseCategory } from '../types';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface CategorySummaryListProps {
    expenses: Expense[];
    onSelectCategory: (category: ExpenseCategory) => void;
}

const categoryColors: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Food]: 'border-red-500',
  [ExpenseCategory.Transport]: 'border-blue-500',
  [ExpenseCategory.Groceries]: 'border-green-500',
  [ExpenseCategory.Utilities]: 'border-yellow-500',
  [ExpenseCategory.Entertainment]: 'border-purple-500',
  [ExpenseCategory.Shopping]: 'border-pink-500',
  [ExpenseCategory.Health]: 'border-indigo-500',
  [ExpenseCategory.Other]: 'border-gray-500',
};

const CategorySummaryList: React.FC<CategorySummaryListProps> = ({ expenses, onSelectCategory }) => {
    // FIX: Correctly typed the initial value for the reduce function.
    // The untyped `{}` caused TypeScript to infer accumulator values as `unknown`, leading to errors.
    // Asserting the type to `Record<string, number>` ensures proper type inference.
    const categoryTotals = expenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
            acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
    
    if (sortedCategories.length === 0) {
        return (
          <div className="text-center py-12 px-4 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold text-white">No Expenses Yet</h3>
            <p className="text-gray-400 mt-2">Click the '+' button to add your first expense!</p>
          </div>
        );
      }

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Expenses by Category</h2>
            <div className="space-y-3">
                {sortedCategories.map(([category, total]) => (
                    <button
                        key={category}
                        onClick={() => onSelectCategory(category as ExpenseCategory)}
                        className={`w-full bg-gray-800 p-4 rounded-lg flex items-center justify-between shadow-md hover:bg-gray-700/50 transition-colors border-l-4 ${categoryColors[category as ExpenseCategory]}`}
                    >
                        <span className="font-semibold text-white">{category}</span>
                        <div className="flex items-center space-x-3">
                            <span className="font-bold text-lg text-white">₹{total.toFixed(2)}</span>
                            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategorySummaryList;