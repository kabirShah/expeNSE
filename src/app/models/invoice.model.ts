export interface Invoice {
  _id?: string;
  _rev?: string;
  userId: string;
  expenseId?: string;
  invoiceNumber?: string;
  date: string;
  total: number;
  tax?: number; // This was already in the model, but you need to ensure you use it consistently
  taxAmount?: number; // Add this field for tax amount if you want to display it separately
  storeName?: string; // Add this field for the store name (e.g., restaurant, shop)
  paymentMethod?: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
    total?: number;
  }>;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
