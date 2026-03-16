export interface Settlement {
  id?: number;
  group_id?: number;
  expense_id?: number | null;
  from_member_id: number;
  to_member_id: number;
  amount: number;
  status?: 'pending' | 'paid';
  method?: string;
  created_at?: string;
}
