export interface DebitCard {
  _id?: string; // Unique ID assigned by PouchDB
  _rev?: string; // Revision ID for updates
    userId: string; // User to whom the card belongs
    cardNumber: string; // Masked or partial card number
    cardHolderName: string; // Cardholder's name
    expiryDate: string; // Expiration date (MM/YY)
    linkedAccount: string; // Bank account linked to the card
    bankName?: string; // Optional: Name of the bank
  }
  