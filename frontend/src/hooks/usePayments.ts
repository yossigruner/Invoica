import { useState } from 'react';
import { paymentsApi } from '@/api/payments';
import { toast } from 'sonner';

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

export function usePayments() {
  const [isLoading, setIsLoading] = useState(false);

  const generatePaymentLink = async (params: GeneratePaymentLinkParams): Promise<PaymentLink | null> => {
    try {
      setIsLoading(true);
      const response = await paymentsApi.generatePaymentLink(params);
      return response;
    } catch (error) {
      console.error('Failed to generate payment link:', error);
      toast.error('Failed to generate payment link');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generatePaymentLink,
    isLoading,
  };
} 