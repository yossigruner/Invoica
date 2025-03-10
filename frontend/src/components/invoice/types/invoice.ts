export interface InvoiceFormData {
  to: {
    id?: string;
    name: string;
    address: string;
    zip: string;
    city: string;
    province: string;
    country: string;
    email: string;
    phone: string;
  };
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  items: InvoiceFormItem[];
  additionalNotes: string;
  paymentTerms: string;
  paymentMethod: string;
  adjustments: {
    discount: { value: number; type: 'amount' | 'percentage' };
    tax: { value: number; type: 'amount' | 'percentage' };
    shipping: { value: number; type: 'amount' | 'percentage' };
  };
}

export interface InvoiceFormItem {
  id?: string;
  invoice_id?: string;
  name: string;
  description: string;
  quantity: number;
  rate: number;
  amount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerData {
  id?: string;
  name: string;
  address?: string;
  zip?: string;
  city?: string;
  province?: string;
  country?: string;
  email: string;
  phone?: string;
}

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  companyAddress?: string;
  companyCity?: string;
  companyZip?: string;
  companyCountry?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyRegistration?: string;
  companyVat?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
  iban: string;
  cloverApiKey?: string;
  cloverMerchantId?: string;
  signature?: string | null;
  companyLogo?: string | null;
  preferredCurrency?: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  name: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
  created_at: string;
  updated_at: string;
}
