/**
 * AA Account Model
 * Represents a bank account linked via Account Aggregator
 */
export interface AAAccount {
  id: number;
  user_id: number;
  consent_id: number;
  account_ref: string;
  masked_account_number: string;
  bank_name: string;
  account_type: AAAccountType;
  ifsc: string | null;
  status: AAAccountStatus;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export type AAAccountType = 'SAVINGS' | 'CURRENT';
export type AAAccountStatus = 'ACTIVE' | 'INACTIVE';

/**
 * AA Account with Balance Info
 */
export interface AAAccountWithBalance extends AAAccount {
  current_balance?: number;
  available_balance?: number;
}

/**
 * AA Accounts API Response
 */
export interface AAAccountsApiResponse {
  success: boolean;
  data: AAAccount[];
  total?: number;
}