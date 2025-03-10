import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '@/api/invoices';

export function usePublicInvoice(id: string) {
  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['public-invoice', id],
    queryFn: () => invoicesApi.getPublicOne(id),
    enabled: !!id,
  });

  return {
    invoice,
    isLoading,
    error,
  };
} 