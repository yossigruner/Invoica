import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi, type Invoice, type CreateInvoiceDto, type UpdateInvoiceDto } from '@/api/invoices';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export function useInvoices() {
  const queryClient = useQueryClient();

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: invoicesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateInvoiceDto) => {
      try {
        logger.info('Creating invoice:', data);
        return await invoicesApi.create(data);
      } catch (error: any) {
        logger.error('Failed to create invoice:', error);
        throw error;
      }
    },
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

  const updateMutation = useMutation({
    mutationFn: async (params: { id: string; data: UpdateInvoiceDto }) => {
      try {
        logger.info('Update mutation called with:', { 
          id: params?.id,
          data: params?.data
        });
        
        if (!params?.id) {
          const error = new Error('Invoice ID is required for update');
          logger.error('Missing invoice ID:', { params });
          throw error;
        }

        return await invoicesApi.update(params.id, params.data);
      } catch (error: any) {
        logger.error('Failed to update invoice:', { 
          error,
          params
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      logger.info('Update successful:', { id: variables.id });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any, variables) => {
      logger.error('Failed to update invoice:', { 
        error, 
        id: variables.id,
        data: variables.data 
      });
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
    mutationFn: async (id: string) => {
      try {
        logger.info('Deleting invoice:', id);
        return await invoicesApi.delete(id);
      } catch (error: any) {
        logger.error('Failed to delete invoice:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      logger.error('Failed to delete invoice:', error);
      toast.error('Failed to delete invoice');
    },
  });

  return {
    invoices,
    isLoading,
    error,
    createInvoice: (data: CreateInvoiceDto) => createMutation.mutateAsync(data),
    updateInvoice: async (params: { id: string; data: UpdateInvoiceDto }) => {
      logger.info('updateInvoice called with:', {
        id: params?.id,
        hasData: !!params?.data,
        data: params?.data
      });
      return updateMutation.mutateAsync(params);
    },
    deleteInvoice: (id: string) => deleteMutation.mutateAsync(id),
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