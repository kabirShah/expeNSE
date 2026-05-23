// src/app/receipt/models/receipt.model.ts

export interface Receipt {
  id: number;
  user_id: number;
  image: string;
  image_url: string;
  amount: number | null;
  date: string | null;         // ISO date string: YYYY-MM-DD
  merchant: string | null;
  category: string | null;
  currency: string | null;
  raw_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReceiptOcrResult {
  amount: number | null;
  date: string | null;
  merchant: string | null;
  category: string | null;
  currency: string | null;
  raw_text: string | null;
}

export interface ReceiptListFilters {
  month?: number;
  year?: number;
  page?: number;
  per_page?: number;
}

export interface PaginatedReceipts {
  data: Receipt[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}
