/**
 * Notification Expense Model
 * Represents an expense detected from mobile notifications
 */
export interface NotificationExpense {
  id?: number;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  date: string;
  narration: string;
  reference_id?: string;
  source: 'NOTIFICATION';
  merchant?: string;
  account?: string;
  raw_notification?: string;
  package_name?: string;
  hash?: string;
}

export interface NotificationExpenseResponse {
  success: boolean;
  data?: NotificationExpense;
  message?: string;
  is_duplicate?: boolean;
}

export interface NotificationPackage {
  name: string;
  displayName: string;
  type: 'bank' | 'upi' | 'wallet';
}

export const KNOWN_NOTIFICATION_PACKAGES: NotificationPackage[] = [
  // Banks
  { name: 'com.google.android.apps.nbu.paisa', displayName: 'Google Pay', type: 'upi' },
  { name: 'com.phonepe.app', displayName: 'PhonePe', type: 'upi' },
  { name: 'com.paytm', displayName: 'Paytm', type: 'upi' },
  { name: 'com.axis.mobile', displayName: 'Axis Bank', type: 'bank' },
  { name: 'com.icici.infinit', displayName: 'ICICI Bank', type: 'bank' },
  { name: 'com.hdfcbank', displayName: 'HDFC Bank', type: 'bank' },
  { name: 'com.sbi', displayName: 'State Bank', type: 'bank' },
  { name: 'com.idfcfirstbank', displayName: 'IDFC Bank', type: 'bank' },
  { name: 'com.kotak', displayName: 'Kotak Bank', type: 'bank' },
  { name: 'com.YesBank', displayName: 'Yes Bank', type: 'bank' },
  { name: 'com.standardchartered', displayName: 'Standard Chartered', type: 'bank' },
  { name: 'com.postbank', displayName: 'Post Bank', type: 'bank' },
  { name: 'com.bankofbaroda', displayName: 'Bank of Baroda', type: 'bank' },
  { name: 'com.canarabank', displayName: 'Canara Bank', type: 'bank' },
  { name: 'com.pnb', displayName: 'Punjab National Bank', type: 'bank' },
  { name: 'com.bobcat', displayName: 'BOB Bank', type: 'bank' },
  { name: 'com.unionbankofindia', displayName: 'Union Bank', type: 'bank' },
  { name: 'com.bankofindia', displayName: 'Bank of India', type: 'bank' },
  // UPI Apps
  { name: 'com.google.android.apps.pay', displayName: 'Google Pay', type: 'upi' },
  { name: 'com.mobikwik', displayName: 'MobiKwik', type: 'wallet' },
  { name: 'com.freecharge', displayName: 'FreeCharge', type: 'wallet' },
  { name: 'com.cred', displayName: 'CRED', type: 'wallet' },
  // Wallets
  { name: 'com.paytm.mobile', displayName: 'Paytm', type: 'wallet' },
  { name: 'com.amazon.mShop.android.shopping', displayName: 'Amazon Pay', type: 'wallet' },
];

export interface ParsedNotification {
  amount: number | null;
  type: 'CREDIT' | 'DEBIT' | null;
  date: Date | null;
  narration: string;
  reference: string | null;
  merchant: string | null;
  isValid: boolean;
}