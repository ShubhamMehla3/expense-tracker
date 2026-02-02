
import { Expense } from '../types';

export interface DayGroup {
  [dayHeader: string]: Expense[];
}

export interface TimelineGroup {
  [monthHeader: string]: DayGroup;
}

/**
 * Formats a date string (YYYY-MM-DD) into a day header.
 * Special cases for "Today" and "Yesterday".
 * @param dateString The date string in "YYYY-MM-DD" format.
 * @returns A formatted string (e.g., "Today", "Yesterday", "Oct 20").
 */
const formatDayHeader = (dateString: string): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const expenseDate = new Date(dateString + 'T00:00:00');
  expenseDate.setHours(0, 0, 0, 0);

  if (expenseDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (expenseDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }
  return expenseDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats a date string (YYYY-MM-DD) into a month and year header.
 * @param dateString The date string in "YYYY-MM-DD" format.
 * @returns A formatted string (e.g., "October 2024").
 */
const formatMonthHeader = (dateString: string): string => {
    const expenseDate = new Date(dateString + 'T00:00:00');
    return expenseDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
    });
}

/**
 * Groups an array of expenses hierarchically for timeline view (by month, then day).
 * @param expenses An array of Expense objects.
 * @returns An object where keys are formatted month headers, and values are objects of day groups.
 */
export const groupExpensesForTimeline = (expenses: Expense[]): TimelineGroup => {
  // Sort expenses descending by date first to ensure correct chronological order.
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return sortedExpenses.reduce((acc, expense) => {
    const monthHeader = formatMonthHeader(expense.date);
    const dayHeader = formatDayHeader(expense.date);
    
    if (!acc[monthHeader]) {
      acc[monthHeader] = {};
    }
    if (!acc[monthHeader][dayHeader]) {
      acc[monthHeader][dayHeader] = [];
    }
    acc[monthHeader][dayHeader].push(expense);
    return acc;
  }, {} as TimelineGroup);
};


// === Time Navigation Utilities ===

type TimeRange = 'week' | 'month' | 'year' | 'all';

export const getWeekRange = (date: Date): { start: Date, end: Date } => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Sunday
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6); // Saturday
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
};

export const getMonthRange = (date: Date): { start: Date, end: Date } => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

export const getYearRange = (date: Date): { start: Date, end: Date } => {
    const start = new Date(date.getFullYear(), 0, 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date.getFullYear(), 11, 31);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
};

export const formatPeriodDisplay = (range: TimeRange, date: Date): string => {
    switch (range) {
        case 'week':
            const { start, end } = getWeekRange(date);
            const startMonth = start.toLocaleString('en-US', { month: 'short' });
            const endMonth = end.toLocaleString('en-US', { month: 'short' });
            if (start.getFullYear() !== end.getFullYear()) {
                 return `${startMonth} ${start.getDate()}, ${start.getFullYear()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
            }
            if (startMonth === endMonth) {
                return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
            }
            return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
        case 'month':
            return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        case 'year':
            return date.getFullYear().toString();
        case 'all':
            return 'All Time';
    }
};
