export interface Expense {
  id?: number;          // auto increment id (Laravel default)
  expense_id?: string;  // UUID
  user_id?: number;     // will come from backend
  category?: {
    id: number;
    name: string;
    parent_id?: number | null;
  };
  transaction_type: string;
  description: string;
  amount: number;
  date: string;         // ISO date string
  payment_source?: 'gpay' | 'phonepe' | 'paytm' | 'upi' | 'bank' | 'unknown' | null;
  source_type?: string | null;
  source_ref_id?: number | null;
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
export interface ExpenseContribution {
  member_id: number;
  amount_paid: number;
}

export interface ExpenseShare {
  member_id: number;
  share_amount: number;
  amount_settled?: number;
  status?: string;
}

export interface GroupExpense {
  id?: number;
  expense_uuid?: string;
  group_id?: number;
  created_by?: number;
  title: string;
  total_amount: number;
  split_type: 'equal' | 'custom' | 'weight';
  date?: string;
  note?: string;
  contributions?: ExpenseContribution[];
  shares?: ExpenseShare[];
  created_at?: string;
}
