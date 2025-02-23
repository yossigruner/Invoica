import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { Customer } from '@/types';
import { toast } from 'sonner';

export const PAGE_SIZE_OPTIONS: number[] = [5, 10, 25, 50];

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // Fetch all customers for the current user
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('Starting to fetch customers');

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        logger.error('Failed to get user', userError);
        throw userError;
      }
      if (!user) {
        logger.error('No user found');
        throw new Error('No user found');
      }

      logger.info('Fetching customers for user', { userId: user.id });

      const { data, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (customersError) {
        logger.error('Failed to fetch customers from Supabase', customersError);
        throw customersError;
      }

      logger.info('Customers fetched successfully', { 
        count: data.length,
        customers: data 
      });

      setCustomers(data || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to fetch customers', error);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Create a new customer
  const createCustomer = async (customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { data, error: createError } = await supabase
        .from('customers')
        .insert([{ ...customerData, user_id: user.id }])
        .select()
        .single();

      if (createError) throw createError;

      await fetchCustomers(); // Refresh the entire list
      logger.success('Customer created successfully', { customerId: data.id });
      toast.success('Customer created successfully');
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to create customer', error);
      toast.error('Failed to create customer');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing customer
  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { data, error: updateError } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchCustomers(); // Refresh the entire list
      logger.success('Customer updated successfully', { customerId: id });
      toast.success('Customer updated successfully');
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to update customer', error);
      toast.error('Failed to update customer');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a customer
  const deleteCustomer = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      await fetchCustomers(); // Refresh the entire list
      logger.success('Customer deleted successfully', { customerId: id });
      toast.success('Customer deleted successfully');
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to delete customer', error);
      toast.error('Failed to delete customer');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Filter and paginate customers
  const filteredCustomers = customers.filter((customer) =>
    Object.values(customer).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to first page when page size changes
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    logger.info('Changed customers page size', { newSize });
  };

  // Log the state of customers at each step
  useEffect(() => {
    logger.info('Current customers state:', {
      totalCustomers: customers.length,
      filteredCount: filteredCustomers.length,
      paginatedCount: paginatedCustomers.length,
      currentPage,
      pageSize,
      searchQuery,
      totalPages
    });
  }, [customers, filteredCustomers.length, paginatedCustomers.length, currentPage, pageSize, searchQuery, totalPages]);

  return {
    customers: paginatedCustomers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize: handlePageSizeChange,
    totalPages,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    fetchCustomers
  };
};
