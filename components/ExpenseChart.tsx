
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Expense, ExpenseCategory } from '../types';

interface ExpenseChartProps {
  expenses: Expense[];
}

const COLORS: Record<ExpenseCategory, string> = {
    [ExpenseCategory.Food]: '#EF4444', // red-500
    [ExpenseCategory.Transport]: '#3B82F6', // blue-500
    [ExpenseCategory.Groceries]: '#22C55E', // green-500
    [ExpenseCategory.Utilities]: '#EAB308', // yellow-500
    [ExpenseCategory.Entertainment]: '#A855F7', // purple-500
    [ExpenseCategory.Shopping]: '#EC4899', // pink-500
    [ExpenseCategory.Health]: '#6366F1', // indigo-500
    [ExpenseCategory.Other]: '#6B7280', // gray-500
};


const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
  const data = Object.values(ExpenseCategory).map(category => {
    const total = expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    return { name: category, value: total };
  }).filter(item => item.value > 0);

  if (data.length === 0) {
    return null; // Don't render chart if there's no data
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-300 mb-4 text-center">Expense Breakdown</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                return (
                  <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as ExpenseCategory]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#374151', // gray-700
                borderColor: '#4B5563', // gray-600
                color: '#FFFFFF'
              }}
              formatter={(value: number) => `₹${value.toFixed(2)}`}
            />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseChart;
