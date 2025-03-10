import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Customer } from "@/types";
import { customersApi, type CreateCustomerDto } from "@/api/customers";
import { logger } from "@/utils/logger";
import { toast } from 'sonner';

interface UseCustomersOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
}

export function useCustomers(options: UseCustomersOptions = {}) {
  const queryClient = useQueryClient();
  const { page = 1, limit = 10, search, sortBy = 'createdAt' } = options;

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['customers', { page, limit, search, sortBy }],
    queryFn: () => customersApi.getCustomers({ page, limit, search, sortBy }),
  });

  const { mutate: createCustomer, isPending: isCreating } = useMutation({
    mutationFn: (data: CreateCustomerDto) => customersApi.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error) => {
      logger.error('Failed to create customer', error);
    },
  });

  const { mutate: updateCustomer, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCustomerDto }) =>
      customersApi.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error) => {
      logger.error('Failed to update customer', error);
    },
  });

  const { mutate: deleteCustomer, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => customersApi.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error) => {
      logger.error('Failed to delete customer', error);
    },
  });

  return {
    customers: response?.data || [],
    meta: response?.meta,
    isLoading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    isCreating,
    isUpdating,
    isDeleting,
  };
}
