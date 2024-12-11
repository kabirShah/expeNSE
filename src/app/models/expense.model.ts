export interface Expense {
  _id?: string; // Unique ID assigned by PouchDB
  _rev?: string; // Revision ID for updates
  category: string; // Category of the expense
  transactionType: string; // Type of transaction (e.g., income or expense)
  description: string; // Description of the expense
  amount: number; // Amount spent
  notes?: string; // Additional notes (optional)
  date: string; // Date of the expense
  paidBy: string; // Who paid the expense
  createdAt?: string;
  updatedAt?:string;
}

export interface Transaction {
  transactionId?: string; // Unique transaction ID
  expenseId: string; // Linked expense ID
  date: string; // Transaction date
  paymentMethod: string; // Payment method used
  status: string; // Transaction status (e.g., completed, pending)
  referenceNumber?: string; // Optional reference for tracking
  createdAt?: string; // Record creation timestamp
  updatedAt?: string; // Last update timestamp
}

export interface ExpenseCategory {
  id: string; // Unique category ID
  name: string; // Category name (e.g., "Groceries")
  type: 'income' | 'expense'; // For distinguishing between income and expense categories
}

export interface TransactionType {
  id: string; // Unique transaction type ID
  method: string; // Payment method name (e.g., "Credit Card")
}
