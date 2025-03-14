import api, { publicApi } from './axios';
import { logger } from '@/utils/logger';
import axios from 'axios';

export interface InvoiceItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: string;
  userId: string;
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

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetInvoicesParams {
  page?: number;
  limit?: number;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

interface PaymentResponse {
  paymentId: string;
  amount: number;
  status: string;
  createdAt: string;
  href: string;
}

export const invoicesApi = {
  async create(data: CreateInvoiceDto): Promise<Invoice> {
    logger.info('Creating invoice with data:', data);
    const response = await api.post('/invoices', data);
    return response.data;
  },

  async getAll(params?: GetInvoicesParams): Promise<PaginatedResponse<Invoice>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.searchQuery) searchParams.append('searchQuery', params.searchQuery);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const queryString = searchParams.toString();
    const url = queryString ? `/invoices?${queryString}` : '/invoices';
    const response = await api.get(url);
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

  async generatePaymentLink(id: string): Promise<PaymentResponse> {
    const response = await publicApi.post(`/invoices/${id}/payment`);
    return response.data;
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
  },

  sendInvoice: async (id: string) => {
    const response = await api.post(`/invoices/${id}/send`);
    return response.data;
  }
}; 