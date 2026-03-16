export interface Balance {
  id: number;
  balance_id: string;  // UUID
  amount: number;
  source: string;
  date_added: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}
