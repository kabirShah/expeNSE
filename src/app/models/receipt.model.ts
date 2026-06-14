// receipt.model.ts

export type ReceiptStatus = 'draft' | 'processing' | 'review' | 'confirmed' | 'saved' | 'failed';
export type ReceiptType = 'grocery' | 'restaurant' | 'fuel' | 'pharmacy' | 'utility' | 'shopping' | 'mall' | 'transport' | 'entertainment' | 'general';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'netbanking' | null;
export type FieldStatus = 'auto' | 'manual' | 'low_confidence' | 'missing';

export interface ReceiptItem {
  id?: number;
  receipt_id?: number;
  name: string;
  qty: number;
  unit?: string | null;
  unit_price: number;
  discount: number;
  tax_rate: number;
  tax: number;
  total: number;
  confidence: number;
  is_manual: boolean;
  ocr_bounding_box?: BoundingBox | null;
  sort_order: number;
}

export interface BoundingBox {
  vertices?: Array<{ x: number; y: number }>;
  x1?: number; y1?: number; x2?: number; y2?: number; // Tesseract format
}

export interface ReceiptActivity {
  id: number;
  action: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface Receipt {
  id: number;
  merchant: string | null;
  receipt_type: ReceiptType;
  receipt_date: string | null;
  currency: string;
  payment_method: PaymentMethod;
  reference_number: string | null;
  language: string;

  subtotal: number;
  discount: number;
  tax: number;
  total: number;

  expense_title: string | null;
  notes: string | null;

  status: ReceiptStatus;
  requires_review: boolean;
  is_duplicate: boolean;
  ocr_confidence: number;
  ocr_provider: string | null;
  field_status: Record<string, FieldStatus>;

  // Image fields
  original_image?: string | null;
  processed_image?: string | null;
  // backward-compat
  has_image?: boolean;
  has_processed_img?: boolean;

  expense_id: number | null;
  expense?: any;
  category?: any;
  account?: any;

  items: ReceiptItem[];
  activity?: ReceiptActivity[];

  created_at: string;
  updated_at: string;
}

export interface ReceiptListItem {
  id: number;
  merchant: string | null;
  total: number;
  currency: string;
  receipt_type: ReceiptType;
  receipt_date: string | null;
  status: ReceiptStatus;
  ocr_confidence: number;
  requires_review: boolean;
  is_duplicate: boolean;
  has_expense: boolean;
  category?: any;
  created_at: string;
}

export interface ReceiptUploadResult {
  message: string;
  data: Receipt;
}

export interface ReceiptOCRStatus {
  id: number;
  status: ReceiptStatus;
  ocr_confidence: number;
  requires_review: boolean;
  is_duplicate: boolean;
  processed_at: string;
}

export interface ReceiptListResponse {
  data: ReceiptListItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ReceiptFilters {
  search?: string;
  status?: ReceiptStatus;
  category_id?: number;
  date_from?: string;
  date_to?: string;
  receipt_type?: ReceiptType;
  requires_review?: boolean;
  page?: number;
  per_page?: number;
}

// ─── For the review/edit form ────────────────────────────────────────────────

export interface ReceiptEditForm {
  merchant: string;
  receipt_date: string;
  currency: string;
  receipt_type: ReceiptType;
  payment_method: PaymentMethod;
  reference_number: string;
  expense_title: string;
  notes: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  category_id: number | null;
  account_id: number | null;
  items: ReceiptItemForm[];
}

export interface ReceiptItemForm {
  id?: number;
  name: string;
  qty: number;
  unit: string;
  unit_price: number;
  discount: number;
  tax_rate: number;
  total: number;
}

// ─── Offline queue ────────────────────────────────────────────────────────────

export interface OfflineReceiptQueue {
  id: string;
  filePath: string;
  mimeType: string;
  queuedAt: string;
  attempts: number;
  status: 'pending' | 'uploading' | 'failed';
}
