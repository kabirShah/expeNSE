export interface GroupMember {
  id: number;
  group_id: number;
  user_id?: number | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: 'admin' | 'member';
  joined_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface GroupExpense {
  id: number;
  group_id: number;
  paid_by: number;
  category_id?: number;
  title: string;
  amount: number;
  split_type: 'equal' | 'exact' | 'percentage' | 'shares';
  notes?: string;
  receipt_image?: string;
  expense_date: string;
  created_by: number;
  paid_by_member?: GroupMember;
  splits?: GroupExpenseSplit[];
}

export interface GroupExpenseSplit {
  id: number;
  group_expense_id: number;
  member_id: number;
  owed_amount: number;
  percentage?: number;
  shares?: number;
  is_settled: boolean;
  settled_at?: string;
  member?: GroupMember;
}

export interface GroupSettlement {
  id: number;
  group_id: number;
  payer_id: number;
  payee_id: number;
  amount: number;
  notes?: string;
  settled_at: string;
  recorded_by: number;
}

export interface GroupActivity {
  id: number;
  group_id: number;
  user_id: number;
  type: 'expense_added' | 'expense_edited' | 'expense_deleted' | 'member_added' | 'member_removed' | 'settlement';
  entity_id?: number;
  message: string;
  created_at: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  type: 'trip' | 'home' | 'couple' | 'office' | 'other';
  created_by: number;
  avatar?: string;
  currency: string;
  is_active: boolean;
  members?: GroupMember[];
  expenses?: GroupExpense[];
  expenses_count?: number;
  my_balance?: number;
  activity?: GroupActivity[];
  created_at?: string;
  updated_at?: string;
}

export interface GroupDetail {
  group: Group;
  balances: GroupBalance[];
  debts: GroupDebt[];
}

export interface GroupBalance {
  member_id: number;
  member_name: string;
  total_paid: number;
  total_owed: number;
  total_received: number;
  total_sent: number;
  net_balance: number;
}

export interface GroupDebt {
  from_member_id: number;
  from_name: string;
  to_member_id: number;
  to_name: string;
  amount_owed: number;
}
