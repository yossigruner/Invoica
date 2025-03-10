import { api } from '@/lib/api';

interface GeneratePaymentLinkParams {
  invoiceId: string;
  amount: number;
  currency: string;
  subtotal: number;
  taxValue: number;
}

interface PaymentLink {
  paymentId: string;
  amount: number;
  status: string;
  createdAt: string;
  checkoutUrl: string;
  expiresAt: string;
}

export const paymentsApi = {
  generatePaymentLink: async (params: GeneratePaymentLinkParams): Promise<PaymentLink> => {
    const response = await api.post('/payments/generate-link', params);
    return response.data;
  },
}; 