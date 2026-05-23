export interface DeviceSmsMessage {
  sender: string | null;
  sms_body: string;
  received_at: string | null;
  received_at_millis?: number | null;
  source_app?: string | null;
  external_id?: string | null;
}

export type ParsedTransactionType = 'expense' | 'income' | 'unknown';
export type ParsedAccountType = 'bank' | 'upi' | 'card' | 'wallet';
export type ParsedMode = 'upi' | 'card' | 'netbanking' | 'atm' | 'unknown';

export interface ParsedSmsData {
  is_transaction: boolean;
  type: ParsedTransactionType;
  amount: number | null;
  currency: 'INR';
  account: string | null;
  account_type: ParsedAccountType | null;
  merchant: string | null;
  mode: ParsedMode;
  reference_id: string | null;
  date: string | null;
  time: string | null;
  account_last4?: string | null;
  reference?: string | null;
  payment_source?: string | null;
  category?: 'food' | 'shopping' | 'travel' | 'bills' | 'transfer' | 'recharge' | 'entertainment' | 'other';
}

export interface SmsEntry {
  id: number;
  sender: string | null;
  sms_body: string;
  parsed_data: ParsedSmsData | null;
  status: 'pending' | 'confirmed' | 'ignored';
  is_financial: boolean;
  received_at: string | null;
  source_app: string | null;
  external_id: string | null;
  created_at?: string;
  updated_at?: string;
}
