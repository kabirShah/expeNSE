export type SharedSplitType = 'equal' | 'exact' | 'percentage' | 'shares' | 'share' | 'custom' | 'item' | 'itemized' | 'item_based';
export type SharedGroupType = 'trip' | 'home' | 'flatmates' | 'family' | 'office' | 'friends' | 'couple' | 'event' | 'custom';

export interface SharedFriend {
  id: number;
  friend_user_id?: number | null;
  display_name?: string | null;
  phone?: string | null;
  email?: string | null;
  status: 'pending' | 'requested' | 'accepted' | 'rejected' | 'blocked' | 'invited';
  is_favorite: boolean;
  usage_count: number;
  last_used_at?: string | null;
  friend_user?: any;
}

export interface DeviceContact {
  id: number;
  device_contact_id?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  matched_user_id?: number | null;
  is_registered: boolean;
  is_invited: boolean;
  matched_user?: any;
}

export interface SharedParticipant {
  user_id: number;
  amount?: number | null;
  percentage?: number | null;
  shares?: number | null;
  items?: string[];
}

export interface SharedPayer {
  user_id: number;
  amount_paid: number;
}

export interface SharedItem {
  name?: string;
  amount: number;
  user_ids: number[];
}

export interface SharedSplitResult {
  user_id: number;
  amount_owed: number;
  shares?: number | null;
  percentage?: number | null;
  items?: string[];
}

export interface SharedExpensePayload {
  group_id: number;
  title: string;
  description?: string | null;
  amount: number;
  currency?: string;
  expense_date: string;
  category_id?: number | null;
  category_name?: string | null;
  merchant_name?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  split_type: SharedSplitType;
  participants: SharedParticipant[];
  payers: SharedPayer[];
  items?: SharedItem[];
  linked_transaction_id?: number | null;
  transaction_reference?: string | null;
}

export interface RecurringSharedExpense {
  id?: number;
  group_id?: number | null;
  title: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  split_type: SharedSplitType;
  payers: SharedPayer[];
  participants: SharedParticipant[];
  start_date: string;
  end_date?: string | null;
  auto_generate?: boolean;
  status?: 'active' | 'paused' | 'archived';
}

export interface SharedApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
