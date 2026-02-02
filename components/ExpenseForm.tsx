
import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, Item } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  initialData: Partial<Omit<Expense, 'id'>> | null;
  isLoading: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, initialData, isLoading }) => {
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.Other);
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [currentItemName, setCurrentItemName] = useState('');
  const [currentItemPrice, setCurrentItemPrice] = useState<number | ''>('');
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (initialData) {
      setPayee(initialData.payee || '');
      setAmount(initialData.amount || '');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setCategory(initialData.category || ExpenseCategory.Other);
      setDescription(initialData.description || '');
      setItems(initialData.items || []);
      setImagePreview(initialData.imagePreview);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payee && amount && date && category) {
      onSubmit({
        payee,
        amount: Number(amount),
        date,
        category,
        description,
        items,
        imagePreview,
      });
    }
  };

  const handleAddItem = () => {
    if (currentItemName.trim() && currentItemPrice) {
      setItems([...items, { name: currentItemName.trim(), price: Number(currentItemPrice) }]);
      setCurrentItemName('');
      setCurrentItemPrice('');
    }
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setItems(items.filter((_, index) => index !== indexToRemove));
  };

  const InputField: React.FC<{ label: string; id: string; type: string; value: any; onChange: (e: any) => void; required?: boolean; step?: string }> = 
    ({ label, id, ...props }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        id={id}
        {...props}
        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {imagePreview && (
        <div className="mb-4">
          <img src={imagePreview} alt="Receipt preview" className="rounded-lg max-h-48 w-full object-contain" />
        </div>
      )}
      <InputField label="Payee" id="payee" type="text" value={payee} onChange={(e) => setPayee(e.target.value)} required />
      <InputField label="Total Amount (₹)" id="amount" type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || '')} step="0.01" required />
      <InputField label="Date" id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          required
          className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"
        >
          {Object.values(ExpenseCategory).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description (Optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"
          placeholder="e.g., Weekly grocery run"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Items (Optional)</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="text"
            value={currentItemName}
            onChange={(e) => setCurrentItemName(e.target.value)}
            className="md:col-span-2 bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"
            placeholder="Item Name (e.g., Milk)"
          />
          <input
            type="number"
            value={currentItemPrice}
            onChange={(e) => setCurrentItemPrice(parseFloat(e.target.value) || '')}
            className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"
            placeholder="Price (₹)"
            step="0.01"
          />
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="w-full mt-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700"
        >
          Add Item
        </button>
        {items.length > 0 && (
          <ul className="mt-3 space-y-2">
            {items.map((item, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                <span className="text-sm">{item.name}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold">₹{item.price.toFixed(2)}</span>
                  <button type="button" onClick={() => handleRemoveItem(index)} className="text-gray-400 hover:text-red-400">
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {isLoading ? 'Processing...' : 'Save Expense'}
      </button>
    </form>
  );
};

export default ExpenseForm;
