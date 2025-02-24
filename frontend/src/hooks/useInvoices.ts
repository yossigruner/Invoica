import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi, type Invoice, type CreateInvoiceDto, type UpdateInvoiceDto } from '@/api/invoices';
import { toast } from 'sonner';

export function useInvoices() {
  const queryClient = useQueryClient();

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: invoicesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateInvoiceDto) => invoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
    },
    onError: (error) => {
      console.error('Failed to create invoice:', error);
      toast.error('Failed to create invoice');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceDto }) =>
      invoicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update invoice:', error);
      toast.error('Failed to update invoice');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: invoicesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete invoice:', error);
      toast.error('Failed to delete invoice');
    },
  });

  return {
    invoices,
    isLoading,
    error,
    createInvoice: createMutation.mutate,
    updateInvoice: updateMutation.mutate,
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