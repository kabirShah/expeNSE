export interface Expense {
  _id?: string; // Unique ID assigned by PouchDB
  _rev?: string; // Revision ID for updates
  category: string; // Category of the expense
  transactionType: string; // Type of transaction (e.g., income or expense)
  description: string; // Description of the expense
  amount: number; // Amount spent
  notes?: string; // Additional notes (optional)
  date: string; // Date of the expense
  paidBy:string;
}