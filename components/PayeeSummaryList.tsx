import React from 'react';
import { Expense } from '../types';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface PayeeSummaryListProps {
    expenses: Expense[];
    onSelectPayee: (payee: string) => void;
}

const PayeeSummaryList: React.FC<PayeeSummaryListProps> = ({ expenses, onSelectPayee }) => {
    // FIX: Replaced the generic type argument on `.reduce` with a type assertion on the
    // initial value (`{}`). The generic argument syntax `<...>` can conflict with JSX parsing in .tsx files.
    // This change resolves the parsing error and correctly types `payeeTotals`.
    const payeeTotals = expenses.reduce((acc, expense) => {
        if (!acc[expense.payee]) {
            acc[expense.payee] = 0;
        }
        acc[expense.payee] += expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const sortedPayees = Object.entries(payeeTotals).sort(([, a], [, b]) => b - a);

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Expenses by Payee</h2>
            <div className="space-y-3">
                {sortedPayees.map(([payee, total]) => (
                     <button
                        key={payee}
                        onClick={() => onSelectPayee(payee)}
                        className="w-full text-left bg-gray-800 p-4 rounded-lg flex items-center justify-between shadow-md hover:bg-gray-700/50 transition-colors"
                    >
                        <span className="font-semibold text-white truncate">{payee}</span>
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

export default PayeeSummaryList;