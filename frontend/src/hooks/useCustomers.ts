import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi, type Customer, type CreateCustomerDto, type UpdateCustomerDto, type GetCustomersParams } from '@/api/customers';
import { toast } from 'sonner';

export function useCustomers(params?: GetCustomersParams) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', params],
    queryFn: () => customersApi.getAll(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCustomerDto) => customersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
    },
    onError: (error) => {
      console.error('Failed to create customer:', error);
      toast.error('Failed to create customer');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerDto }) =>
      customersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update customer:', error);
      toast.error('Failed to update customer');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete customer:', error);
      toast.error('Failed to delete customer');
    },
  });

  return {
    customers: data?.customers ?? [],
    meta: data?.meta,
    isLoading,
    error,
    createCustomer: createMutation.mutate,
    updateCustomer: updateMutation.mutate,
    deleteCustomer: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
} 