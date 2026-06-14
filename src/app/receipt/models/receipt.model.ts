/**
 * Receipt Models & Interfaces
 * Aligned with backend Receipt model structure
 */

export type ReceiptStatus = 'draft' | 'processing' | 'review' | 'confirmed' | 'saved' | 'failed';
export type ReceiptType = 'grocery' | 'restaurant' | 'fuel' | 'pharmacy' | 'utility' | 'shopping' | 'mall' | 'general';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'netbanking' | 'wallet' | 'other';
export type OCRProvider = 'google_vision' | 'tesseract' | 'azure' | 'aws_textract';

/**
 * Receipt Item - Individual line item from receipt
 */
export interface ReceiptItem {
  id?: number;
  receipt_id?: number;
  name: string;
  name_normalized?: string;
  qty: number;
  unit?: string; // kg, g, pcs, ml, etc.
  unit_price: number;
  discount: number;
  tax: number;
  tax_rate: number;
  total: number;
  category?: string;
  sku?: string;
  confidence: number;
  is_manual: boolean;
  sort_order: number;
  ocr_bounding_box?: any;
  created_at?: string;
  updated_at?: string;
}

/**
 * Simple bounding box type used for OCR overlays
 */
export interface BoundingBoxVertex { x: number; y: number }

export interface BoundingBox {
  vertices?: BoundingBoxVertex[];
  x1?: number; y1?: number; x2?: number; y2?: number;
}

/**
 * Receipt Activity - Audit trail
 */
export interface ReceiptActivity {
  id?: number;
  receipt_id?: number;
  user_id?: number;
  action: 'uploaded' | 'ocr_processed' | 'field_edited' | 'confirmed' | 'saved' | 'deleted' | 'reprocessed';
  field_name?: string;
  old_value?: string;
  new_value?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

/**
 * Receipt Review - User confirmation data
 */
export interface ReceiptReview {
  id?: number;
  receipt_id?: number;
  user_id?: number;
  review_fields?: string[];
  corrections?: any;
  approved: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Parsed OCR Data from receipt
 */
export interface ReceiptParsedData {
  merchant?: string;
  date?: string;
  currency?: string;
  receipt_type?: ReceiptType;
  payment_method?: PaymentMethod;
  language?: string;
  items?: ReceiptItem[];
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  expense_title?: string;
  category_suggestion?: string;
  confidence?: number;
}

/**
 * Main Receipt Model - Full receipt data
 */
export interface Receipt {
  id: number;
  uuid?: string;
  user_id: number;
  expense_id?: number | null;
  account_id?: number | null;
  category_id?: number | null;

  // Merchant & Receipt Info
  merchant?: string;
  merchant_normalized?: string;
  receipt_type?: ReceiptType;
  reference_number?: string;
  payment_method?: PaymentMethod;
  currency?: string;
  receipt_date?: string;
  language?: string;

  // Images
  original_image?: string;
  processed_image?: string;
  additional_images?: string[];

  // OCR Raw Output
  raw_ocr_text?: string;
  ocr_bounding_boxes?: any;
  ocr_confidence?: number;
  ocr_provider?: OCRProvider;

  // Parsed Data
  parsed_json?: ReceiptParsedData;
  manual_override_json?: any;
  field_status_json?: any;
  // Field-level status map (e.g. 'merchant': 'low_confidence' | 'confirmed')
  field_status?: { [field: string]: string };

  // Financials
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  expense_title?: string;
  notes?: string;

  // Status
  status: ReceiptStatus;
  requires_review?: boolean;
  is_duplicate?: boolean;
  duplicate_of?: string;

  // Hash for dedup
  receipt_hash?: string;

  // Relationships (when loaded)
  items?: ReceiptItem[];
  activity?: ReceiptActivity[];
  review?: ReceiptReview;
  expense?: any;
  category?: any;
  account?: any;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

/**
 * Receipt List Item - Simplified for listing
 */
export interface ReceiptListItem extends Omit<Receipt, 'raw_ocr_text' | 'ocr_bounding_boxes' | 'parsed_json'> {
  item_count?: number;
  status_label?: string;
  type_icon?: string;
}

export type ReceiptEditForm = Partial<Receipt>;

/**
 * Receipt Filters for API queries
 */
export interface ReceiptFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: ReceiptStatus;
  receipt_type?: ReceiptType;
  category_id?: number;
  date_from?: string;
  date_to?: string;
  requires_review?: boolean;
}

/**
 * Receipt Analytics Data
 */
export interface ReceiptAnalytics {
  total_receipts?: number;
  pending_review?: number;
  total_amount?: number;
  average_amount?: number;
  by_type?: { [key in ReceiptType]?: number };
  by_status?: { [key in ReceiptStatus]?: number };
  by_merchant?: { merchant: string; count: number; total: number }[];
  processing_time?: number;
}

/**
 * Receipt Status Response
 */
export interface ReceiptStatusResponse {
  id: number;
  status: ReceiptStatus;
  ocr_confidence: number;
  requires_review: boolean;
  is_duplicate: boolean;
  processed_at: string;
}

/**
 * Receipt Image URL Response
 */
export interface ReceiptImageUrlResponse {
  url: string;
  expires_in: number;
}

/**
 * Offline Queue Item for receipt uploads
 */
export interface ReceiptOfflineQueueItem {
  id: string;
  type: 'upload' | 'update' | 'delete';
  receiptId?: number;
  data?: any;
  files?: File[];
  status: 'pending' | 'synced' | 'failed';
  error?: string;
  created_at: number;
  retry_count: number;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  links?: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}
