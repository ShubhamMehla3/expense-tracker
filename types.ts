
export enum ExpenseCategory {
  Food = 'Food',
  Transport = 'Transport',
  Groceries = 'Groceries',
  Utilities = 'Utilities',
  Entertainment = 'Entertainment',
  Shopping = 'Shopping',
  Health = 'Health',
  Other = 'Other',
}

export interface Item {
  name: string;
  price: number;
}

export interface Expense {
  id: string;
  payee: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description?: string;
  items?: Item[];
  imagePreview?: string; // base64 string
}
