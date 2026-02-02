
import React, { useState, useEffect, useCallback } from 'react';
import { Expense, ExpenseCategory } from './types';
import Dashboard from './components/Dashboard';
import AddExpenseModal from './components/AddExpenseModal';
import { PlusIcon } from './components/icons/PlusIcon';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const storedExpenses = localStorage.getItem('expenses');
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }
    } catch (error) {
      console.error("Failed to load expenses from localStorage", error);
    }
  }, []);

  const addExpenses = useCallback((newExpenses: Omit<Expense, 'id'> | Omit<Expense, 'id'>[]) => {
    setExpenses(prevExpenses => {
      const expensesToAdd = Array.isArray(newExpenses) ? newExpenses : [newExpenses];
      const processedExpenses = expensesToAdd.map(expense => ({
        ...expense,
        id: `${Date.now()}-${Math.random()}` // Add random part to avoid collision in batch add
      }));
      const updatedExpenses = [...processedExpenses, ...prevExpenses];
      try {
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      } catch (error) {
        console.error("Failed to save expenses to localStorage", error);
      }
      return updatedExpenses;
    });
    setIsModalOpen(false);
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <div className="container mx-auto max-w-2xl p-4 pb-24">
        <header className="text-center my-8">
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Expense Tracker AI
          </h1>
          <p className="text-gray-400 mt-2">Your smart, AI-powered expense manager.</p>
        </header>

        <main>
          <Dashboard expenses={expenses} />
        </main>
      </div>

      <div
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200"
      >
        <PlusIcon className="w-8 h-8" />
      </div>

      {isModalOpen && (
        <AddExpenseModal
          onClose={() => setIsModalOpen(false)}
          onAddExpense={addExpenses}
        />
      )}
    </div>
  );
};

export default App;
