/**
 * AA Consent Model
 * Represents user consent for Account Aggregator
 */
export interface AAConsent {
  id: number;
  user_id: number;
  consent_id: string;
  consent_handle: string | null;
  status: AAConsentStatus;
  purpose_code: string;
  purpose_text: string;
  fi_types: string[];
  data_from: string;
  data_to: string;
  frequency_unit: string;
  frequency_value: number;
  expiry_at: string | null;
  approved_at: string | null;
  revoked_at: string | null;
  raw_response: any | null;
  created_at: string;
  updated_at: string;
}

export type AAConsentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'REVOKED';

/**
 * AA Consent Request Payload
 */
export interface CreateConsentPayload {
  purpose_code: string;
  purpose_text: string;
  fi_types: string[];
  data_from: string;
  data_to: string;
  frequency_unit: string;
  frequency_value: number;
  redirect_url: string;
}

/**
 * AA Consent API Response
 */
export interface AAConsentApiResponse {
  success: boolean;
  message?: string;
  data?: AAConsent;
  consent_id?: string;
  consent_handle?: string;
  consent_url?: string;
}