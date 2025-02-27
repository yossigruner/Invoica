import api from './axios';

export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: string;
  customerId?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: string;
  paymentMethod: string;
  billingName: string;
  billingEmail: string;
  billingPhone: string;
  billingAddress: string;
  billingCity: string;
  billingProvince: string;
  billingZip: string;
  billingCountry: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceItemDto {
  name: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface CreateInvoiceDto {
  customerId?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  currency: string;
  paymentMethod: string;
  status: InvoiceStatus;
  billingName: string;
  billingEmail: string;
  billingPhone?: string;
  billingAddress?: string;
  billingCity?: string;
  billingProvince?: string;
  billingZip?: string;
  billingCountry?: string;
  items: CreateInvoiceItemDto[];
  discountType?: string;
  discountValue?: number;
  taxType?: string;
  taxValue?: number;
  shippingType?: string;
  shippingValue?: number;
}

export interface UpdateInvoiceDto extends Partial<CreateInvoiceDto> {}

export const invoicesApi = {
  async create(data: CreateInvoiceDto): Promise<Invoice> {
    console.log('Creating invoice with data:', data);
    const response = await api.post('/invoices', data);
    return response.data;
  },

  async getAll(): Promise<Invoice[]> {
    const response = await api.get('/invoices');
    return response.data;
  },

  async getOne(id: string): Promise<Invoice> {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  async update(id: string, data: UpdateInvoiceDto): Promise<Invoice> {
    console.log('Updating invoice with data:', { id, data });
    const response = await api.patch(`/invoices/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/invoices/${id}`);
  }
}; 