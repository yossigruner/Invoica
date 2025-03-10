export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  company_name: string;
  company_logo: string;
  company_address: string;
  company_city: string;
  company_zip: string;
  company_country: string;
  company_phone: string;
  company_email: string;
  company_website: string;
  company_registration: string;
  company_vat: string;
  signature: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  swift_code: string;
  iban: string;
  preferred_currency: string;
  is_profile_completed: boolean;
  clover_api_key: string;
  clover_merchant_id: string;
  created_at: string;
  updated_at: string;
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

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string | null;
  currency: string;
  payment_method: string;
  payment_terms: string;
  additional_notes: string | null;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  billing_name: string;
  billing_email: string;
  billing_phone: string;
  billing_address: string;
  billing_city: string;
  billing_zip: string;
  billing_country: string;
  discount_value: number;
  discount_type: 'percentage' | 'amount';
  tax_value: number;
  tax_type: 'percentage' | 'amount';
  shipping_value: number;
  shipping_type: 'percentage' | 'amount';
  subtotal: number;
  total: number;
  created_at: string;
  updated_at: string;
  items: InvoiceItem[];
} 