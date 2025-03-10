import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi, type Invoice, type CreateInvoiceDto, type UpdateInvoiceDto, type GetInvoicesParams } from '@/api/invoices';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export function useInvoices(params?: GetInvoicesParams) {
  const queryClient = useQueryClient();

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoicesApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useMutation<Invoice, Error, CreateInvoiceDto>({
    mutationFn: (data) => invoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          error.response.data.message.forEach((msg: string) => {
            toast.error(msg);
          });
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error('Failed to create invoice');
      }
    },
  });

  const updateMutation = useMutation<Invoice, Error, { id: string; data: UpdateInvoiceDto }>({
    mutationFn: ({ id, data }) => invoicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          error.response.data.message.forEach((msg: string) => {
            toast.error(msg);
          });
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error('Failed to update invoice');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          error.response.data.message.forEach((msg: string) => {
            toast.error(msg);
          });
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error('Failed to delete invoice');
      }
    },
  });

  return {
    invoices,
    isLoading,
    error,
    createInvoice: createMutation.mutateAsync,
    updateInvoice: updateMutation.mutateAsync,
    deleteInvoice: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useInvoice(id: string) {
  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoicesApi.getOne(id),
    enabled: !!id,
  });

  return {
    invoice,
    isLoading,
    error,
  };
} 