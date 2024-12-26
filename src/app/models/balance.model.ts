export interface Balance {
  _id?: string; // Unique ID assigned by PouchDB
  _rev?: string; // Revision ID for updates
  balance: number;       // Name of the balance (e.g., "Bank Account")
}