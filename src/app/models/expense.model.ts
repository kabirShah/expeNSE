export interface Expense {
   id?: number;          // auto increment id (Laravel default)
  expense_id?: string;  // UUID
  user_id?: number;     // will come from backend
  category: string;
  transaction_type: string;
  description: string;
  amount: number;
  date: string;         // ISO date string
  notes?: string;
  paidBy?: string;
  created_at?: string;
  updated_at?: string;
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
