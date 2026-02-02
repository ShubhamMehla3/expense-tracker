
import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface ExpenseItemProps {
  expense: Expense;
}

const categoryColors: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Food]: 'bg-red-500',
  [ExpenseCategory.Transport]: 'bg-blue-500',
  [ExpenseCategory.Groceries]: 'bg-green-500',
  [ExpenseCategory.Utilities]: 'bg-yellow-500',
  [ExpenseCategory.Entertainment]: 'bg-purple-500',
  [ExpenseCategory.Shopping]: 'bg-pink-500',
  [ExpenseCategory.Health]: 'bg-indigo-500',
  [ExpenseCategory.Other]: 'bg-gray-500',
};

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = new Date(expense.date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const hasDetails = (expense.items && expense.items.length > 0) || expense.description;

  return (
    <div className="bg-gray-800 rounded-lg shadow-md transition-all duration-300">
      <div 
        className={`p-4 flex items-center justify-between hover:bg-gray-700/50 ${hasDetails ? 'cursor-pointer' : ''}`}
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        role={hasDetails ? 'button' : undefined}
        tabIndex={hasDetails ? 0 : -1}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { hasDetails && setIsExpanded(!isExpanded); }}}
      >
        <div className="flex items-center space-x-4 min-w-0">
          {expense.imagePreview ? (
              <img src={expense.imagePreview} alt="receipt" className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
          ) : (
              <div className={`w-12 h-12 rounded-md flex-shrink-0 ${categoryColors[expense.category]}`}></div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-white truncate">{expense.payee}</p>
            <p className="text-sm text-gray-400">{formattedDate}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${categoryColors[expense.category]}`}>
              {expense.category}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4 pl-2">
            <p className="font-bold text-lg text-white">
                ₹{expense.amount.toFixed(2)}
            </p>
            {hasDetails && (
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            )}
        </div>
      </div>
      {isExpanded && hasDetails && (
        <div className="px-4 pb-4 border-t border-gray-700 animate-fade-in">
            {expense.description && (
                <p className="text-sm text-gray-300 mt-3 italic">"{expense.description}"</p>
            )}
            {expense.items && expense.items.length > 0 && (
                <div className="mt-3">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Items:</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                        {expense.items.map((item, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{item.name}</span>
                            <span className="font-medium">₹{item.price.toFixed(2)}</span>
                          </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ExpenseItem;
