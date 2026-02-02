
import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory } from '../types';
import ExpenseChart from './ExpenseChart';
import ExpenseList from './ExpenseList';
import CategorySummaryList from './CategorySummaryList';
import PayeeSummaryList from './PayeeSummaryList';
import ItemSummaryList from './ItemSummaryList';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { getWeekRange, getMonthRange, getYearRange, formatPeriodDisplay } from '../utils/dateUtils';


interface DashboardProps {
  expenses: Expense[];
}

type View = 'summary' | 'categoryDetails' | 'payeeDetails' | 'itemDetails';
type SummaryType = 'category' | 'item';
type TimeRange = 'week' | 'month' | 'year' | 'all';

const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
  const [view, setView] = useState<View>('summary');
  const [summaryType, setSummaryType] = useState<SummaryType>('category');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [displayDate, setDisplayDate] = useState(new Date());

  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [selectedPayee, setSelectedPayee] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleSelectCategory = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setView('categoryDetails');
  };

  const handleSelectPayee = (payee: string) => {
    setSelectedPayee(payee);
    setView('payeeDetails');
  };
  
  const handleSelectItem = (itemName: string) => {
    setSelectedItem(itemName);
    setView('itemDetails');
  };

  const handleGoBack = () => {
    setView('summary');
    setSelectedCategory(null);
    setSelectedPayee(null);
    setSelectedItem(null);
  };

  const handleSetTimeRange = (range: TimeRange) => {
    setTimeRange(range);
    setDisplayDate(new Date());
  };

  const handlePrevPeriod = () => {
    setDisplayDate(current => {
        const newDate = new Date(current);
        if (timeRange === 'week') newDate.setDate(newDate.getDate() - 7);
        if (timeRange === 'month') newDate.setDate(1); // Avoid issues with end of month
        if (timeRange === 'month') newDate.setMonth(newDate.getMonth() - 1);
        if (timeRange === 'year') newDate.setFullYear(newDate.getFullYear() - 1);
        return newDate;
    });
  };

  const handleNextPeriod = () => {
      setDisplayDate(current => {
          const newDate = new Date(current);
          if (timeRange === 'week') newDate.setDate(newDate.getDate() + 7);
          if (timeRange === 'month') newDate.setDate(1); // Avoid issues with end of month
          if (timeRange === 'month') newDate.setMonth(newDate.getMonth() + 1);
          if (timeRange === 'year') newDate.setFullYear(newDate.getFullYear() + 1);
          return newDate;
      });
  };

  const isNextDisabled = useMemo(() => {
    if (timeRange === 'all') return true;

    const now = new Date();
    let currentPeriodEnd: Date;

    if (timeRange === 'week') currentPeriodEnd = getWeekRange(displayDate).end;
    else if (timeRange === 'month') currentPeriodEnd = getMonthRange(displayDate).end;
    else currentPeriodEnd = getYearRange(displayDate).end;

    return currentPeriodEnd > now;
  }, [displayDate, timeRange]);

  const timeFilteredExpenses = useMemo(() => {
    if (timeRange === 'all') return expenses;
    
    let range: { start: Date; end: Date };
    if (timeRange === 'week') range = getWeekRange(displayDate);
    else if (timeRange === 'month') range = getMonthRange(displayDate);
    else range = getYearRange(displayDate);
    
    const { start, end } = range;

    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date + 'T00:00:00');
        return expenseDate >= start && expenseDate <= end;
    });
  }, [expenses, timeRange, displayDate]);


  const filteredExpenses = useMemo(() => {
    if (view === 'categoryDetails' && selectedCategory) {
      return timeFilteredExpenses.filter(e => e.category === selectedCategory);
    }
    if (view === 'payeeDetails' && selectedPayee) {
      return timeFilteredExpenses.filter(e => e.payee === selectedPayee && e.category === selectedCategory);
    }
    if (view === 'itemDetails' && selectedItem) {
      return timeFilteredExpenses.filter(e => 
        e.items?.some(item => item.name.trim().toLowerCase() === selectedItem)
      );
    }
    return timeFilteredExpenses;
  }, [timeFilteredExpenses, view, selectedCategory, selectedPayee, selectedItem]);

  const { title, total } = useMemo(() => {
    let calculatedTotal = 0;
    let calculatedTitle = 'Total Expenses';

    const sourceExpenses = view === 'summary' ? timeFilteredExpenses : filteredExpenses;

    switch (view) {
      case 'categoryDetails':
        calculatedTitle = selectedCategory ?? 'Category';
        break;
      case 'payeeDetails':
        calculatedTitle = selectedPayee ?? 'Payee';
        break;
      case 'itemDetails':
        calculatedTitle = `Spent on "${selectedItem}"`;
        break;
      default:
        calculatedTitle = 'Total Expenses';
        break;
    }

    if (view === 'itemDetails' && selectedItem) {
        calculatedTotal = sourceExpenses.reduce((sum, expense) => {
            const itemTotalInExpense = expense.items
                ?.filter(item => item.name.trim().toLowerCase() === selectedItem)
                .reduce((itemSum, item) => itemSum + item.price, 0) || 0;
            return sum + itemTotalInExpense;
        }, 0);
    } else {
        calculatedTotal = sourceExpenses.reduce((sum, e) => sum + e.amount, 0);
    }

    return { title: calculatedTitle, total: calculatedTotal };
  }, [view, selectedCategory, selectedPayee, selectedItem, timeFilteredExpenses, filteredExpenses]);

  const TimeRangeButton: React.FC<{range: TimeRange, label: string}> = ({ range, label }) => (
    <button 
      onClick={() => handleSetTimeRange(range)}
      className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${timeRange === range ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-8">
      <div className="relative">
        {view !== 'summary' && (
          <button onClick={handleGoBack} className="absolute -left-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white rounded-full">
            <ChevronLeftIcon className="w-6 h-6" />
            <span className="sr-only">Go back</span>
          </button>
        )}
        <div className={view !== 'summary' ? 'text-center' : ''}>
          <h2 className="text-xl font-semibold text-gray-300 mb-2 capitalize">{title}</h2>
          <p className="text-4xl font-bold text-white">
            ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="animate-fade-in">
        {view === 'summary' && (
          <>
            <div className="grid grid-cols-4 gap-2 mb-4 bg-gray-800 p-1 rounded-lg w-full max-w-md mx-auto">
                <TimeRangeButton range="week" label="Week" />
                <TimeRangeButton range="month" label="Month" />
                <TimeRangeButton range="year" label="Year" />
                <TimeRangeButton range="all" label="All Time" />
            </div>

            {timeRange !== 'all' && (
                <div className="flex items-center justify-between mb-6 max-w-md mx-auto">
                    <button onClick={handlePrevPeriod} className="p-2 text-gray-400 hover:text-white rounded-full transition-colors">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <span className="font-semibold text-lg text-white text-center w-48 tabular-nums">
                        {formatPeriodDisplay(timeRange, displayDate)}
                    </span>
                    <button onClick={handleNextPeriod} disabled={isNextDisabled} className="p-2 text-gray-400 hover:text-white rounded-full transition-colors disabled:text-gray-600 disabled:cursor-not-allowed">
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </div>
            )}


            <div className="flex justify-center mb-6 bg-gray-800 p-1 rounded-lg w-full max-w-xs mx-auto">
              <button onClick={() => setSummaryType('category')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${summaryType === 'category' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>By Category</button>
              <button onClick={() => setSummaryType('item')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${summaryType === 'item' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>By Item</button>
            </div>
            
            <ExpenseChart expenses={filteredExpenses} />
            <div className="mt-8">
                {summaryType === 'category' ? (
                  <CategorySummaryList expenses={filteredExpenses} onSelectCategory={handleSelectCategory} />
                ) : (
                  <ItemSummaryList expenses={filteredExpenses} onSelectItem={handleSelectItem} />
                )}
            </div>
          </>
        )}

        {(view === 'categoryDetails' || view === 'payeeDetails' || view === 'itemDetails') && (
            <ExpenseList expenses={filteredExpenses} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
