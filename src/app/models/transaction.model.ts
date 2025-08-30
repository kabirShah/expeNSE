export interface Transaction {
  id?: string;
  userId?: string;
  amount: number;
  type: string;
  category?: string;
  status?: string;
  date?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
