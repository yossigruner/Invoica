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
  due_date: string;
  billing_name: string;
  billing_email: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  billing_country: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
} 