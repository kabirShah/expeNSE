export interface CreditCard {
  _id?: string; // Unique ID assigned by PouchDB
  _rev?: string; // Revision ID for updates
  userId: string; // User to whom the card belongs
  cardNumber: string; // Masked or partial card number
  cardHolderName: string; // Cardholder's name
  expiryDate: string; // Expiration date (MM/YY)
  cvv?: string; // Optional, for security purposes (usually not stored)
  creditLimit?: number; // Optional: Credit limit for the card
  billingCycle?: string; // Optional: Monthly billing cycle
}
