
export interface InvoiceFormData {
  to: {
    name: string;
    address: string;
    zip: string;
    city: string;
    country: string;
    email: string;
    phone: string;
  };
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
    rate: number;
    description: string;
  }>;
  additionalNotes: string;
  paymentTerms: string;
  adjustments: {
    discount: { value: number; type: 'amount' | 'percentage' };
    tax: { value: number; type: 'amount' | 'percentage' };
    shipping: { value: number; type: 'amount' | 'percentage' };
  };
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  rate: number;
  description: string;
}
