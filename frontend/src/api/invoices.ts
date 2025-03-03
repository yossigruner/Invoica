import api, { publicApi } from './axios';
import { logger } from '@/utils/logger';
import axios from 'axios';

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
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
  discountType?: string;
  discountValue?: number;
  taxType?: string;
  taxValue?: number;
  shippingType?: string;
  shippingValue?: number;
}

export interface CreateInvoiceDto {
  customerId?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
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
  items: {
    name: string;
    description?: string;
    quantity: number;
    rate: number;
  }[];
  discountType?: 'fixed' | 'percentage';
  discountValue?: number;
  taxType?: 'fixed' | 'percentage';
  taxValue?: number;
  shippingType?: 'fixed' | 'percentage';
  shippingValue?: number;
}

export type UpdateInvoiceDto = Partial<CreateInvoiceDto>;

export const invoicesApi = {
  async create(data: CreateInvoiceDto): Promise<Invoice> {
    logger.info('Creating invoice with data:', data);
    const response = await api.post('/invoices', data);
    return response.data;
  },

  async getAll(): Promise<Invoice[]> {
    const response = await api.get('/invoices');
    return response.data;
  },

  async getOne(id: string): Promise<Invoice> {
    logger.info('Fetching invoice:', id);
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  async getPublicOne(id: string): Promise<Invoice> {
    const response = await publicApi.get(`/invoices/${id}/public`);
    return response.data;
  },

  async update(id: string, data: UpdateInvoiceDto): Promise<Invoice> {
    logger.info('Updating invoice:', { id, data });
    const response = await api.patch(`/invoices/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    logger.info('Deleting invoice:', id);
    await api.delete(`/invoices/${id}`);
  },

  async generatePaymentLink(id: string): Promise<{ href: string; paymentUrl?: string }> {
    const response = await publicApi.post(`/invoices/${id}/payment`);
    const { href } = response.data;
    return { href, paymentUrl: href }; // Return both for backward compatibility
  },

  sendSMS: async (invoiceId: string, phoneNumber: string) => {
    const response = await api.post(`/invoices/${invoiceId}/send-sms`, {
      phoneNumber
    });
    return response.data;
  },

  sendEmail: async (invoiceId: string, email: string) => {
    const response = await api.post(`/invoices/${invoiceId}/send-email`, {
      email
    });
    return response.data;
  },

  downloadPdf: async (invoiceId: string): Promise<Blob> => {
    const response = await publicApi.get(`/invoices/${invoiceId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }
}; 