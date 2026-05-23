/**
 * AA Transaction Model
 * Represents a transaction fetched from Account Aggregator
 */
export interface AATransaction {
  id: number;
  user_id: number;
  aa_account_id: number;
  transaction_id: string;
  amount: number;
  type: AATransactionType;
  narration: string;
  reference: string | null;
  txn_date: string;
  value_date: string | null;
  balance_after: number | null;
  category: string | null;
  raw_data: any | null;
  created_at: string;
  updated_at: string;
}

export type AATransactionType = 'CREDIT' | 'DEBIT';

/**
 * AA Transaction with Account Info
 */
export interface AATransactionWithAccount extends AATransaction {
  account?: {
    bank_name: string;
    masked_account_number: string;
  };
}

/**
 * AA Transactions API Response
 */
export interface AATransactionsApiResponse {
  success: boolean;
  data: AATransaction[];
  total?: number;
  current_page?: number;
  last_page?: number;
}

/**
 * AA Sync Log Model
 */
export interface AASyncLog {
  id: number;
  user_id: number;
  consent_id: number;
  status: 'SUCCESS' | 'FAILED';
  response_code: string | null;
  message: string | null;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * AA Webhook Log Model
 */
export interface AAWebhookLog {
  id: number;
  event_type: string;
  consent_id: string | null;
  payload: any;
  processed: boolean;
  created_at: string;
  updated_at: string;
}