
import React from 'react';
import { Expense } from '../types';
import ExpenseItem from './ExpenseItem';
import { groupExpensesForTimeline } from '../utils/dateUtils';

interface ExpenseListProps {
  expenses: Expense[];
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses }) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold text-white">No Expenses Found</h3>
        <p className="text-gray-400 mt-2">There are no expenses for the selected criteria.</p>
      </div>
    );
  }

  const timelineData = groupExpensesForTimeline(expenses);
  const monthKeys = Object.keys(timelineData);

  return (
    <div className="space-y-12">
      {monthKeys.map((monthKey, monthIndex) => (
        <div key={monthKey} className="relative pl-8">
          {/* Vertical line connecting all items in the month */}
          <div className="absolute left-3 top-2 bottom-0 w-0.5 bg-gray-700"></div>

          {/* Month Header */}
          <h2 className="text-xl font-bold text-white mb-6 relative">
             {/* Large dot for the month start on the timeline */}
             <div className="absolute -left-[22px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-500 border-4 border-gray-900"></div>
             {monthKey}
          </h2>

          <div className="space-y-6">
            {Object.keys(timelineData[monthKey]).map(dayKey => (
              <div key={dayKey} className="relative">
                 {/* Smaller dot for the day group on the timeline */}
                <div className="absolute -left-[18px] top-2 w-3 h-3 rounded-full bg-gray-500 border-2 border-gray-900"></div>
                
                <h3 className="text-md font-semibold text-gray-400 mb-2">{dayKey}</h3>
                <div className="space-y-3">
                    {timelineData[monthKey][dayKey].map(expense => (
                        <ExpenseItem key={expense.id} expense={expense} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
