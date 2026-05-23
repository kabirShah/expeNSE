export interface SplitwiseGroupMember {
  id: number;
  splitwise_group_id: number;
  user_id?: number | null;
  name: string;
  email?: string | null;
  role: 'admin' | 'member';
}

export interface SplitwiseExpenseSplit {
  id: number;
  splitwise_expense_id: number;
  member_id: number;
  amount_owed: number;
  is_settled: boolean;
  member?: SplitwiseGroupMember;
}

export interface SplitwiseExpense {
  id: number;
  splitwise_group_id: number;
  paid_by_member_id: number;
  created_by: number;
  title: string;
  description?: string | null;
  amount: number;
  currency: string;
  expense_date: string;
  paid_by_member?: SplitwiseGroupMember;
  splits?: SplitwiseExpenseSplit[];
}

export interface SplitwiseSettlement {
  id: number;
  splitwise_group_id: number;
  payer_member_id: number;
  payee_member_id: number;
  created_by: number;
  amount: number;
  settled_at: string;
  note?: string | null;
}

export interface SplitwiseGroup {
  id: number;
  created_by: number;
  name: string;
  description?: string | null;
  members?: SplitwiseGroupMember[];
  members_count?: number;
  expenses?: SplitwiseExpense[];
  settlements?: SplitwiseSettlement[];
  created_at?: string;
  updated_at?: string;
}

export interface SplitwiseMemberBalance {
  member_id: number;
  user_id?: number | null;
  name: string;
  email?: string | null;
  balance: number;
  you_are_owed: number;
  you_owe: number;
}

export interface SplitwiseSuggestedSettlement {
  from_member_id: number;
  from_name: string;
  to_member_id: number;
  to_name: string;
  amount: number;
}

export interface SplitwiseBalanceSummary {
  group_id: number;
  group_name: string;
  members: SplitwiseMemberBalance[];
  simplified: SplitwiseSuggestedSettlement[];
}

export interface SplitwiseApiResponse<T> {
  success: boolean;
  data: T;
}
