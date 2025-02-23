import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Invoice } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';
import { InvoiceFormData, InvoiceFormItem } from '@/components/invoice/types/invoice';

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  name: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

export const useInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [invoiceCache, setInvoiceCache] = useState<Record<string, Invoice>>({});

  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(
            id,
            invoice_id,
            name,
            description,
            quantity,
            rate,
            amount,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Ensure items is always an array and map to consistent structure
      const invoicesData = (data || []).map(invoice => ({
        ...invoice,
        items: Array.isArray(invoice.items) ? invoice.items.map((item: InvoiceItem) => ({
          id: item.id,
          invoice_id: item.invoice_id,
          name: item.name || '',
          description: item.description || '',
          quantity: Number(item.quantity) || 0,
          rate: Number(item.rate) || 0,
          amount: Number(item.amount) || 0,
          created_at: item.created_at,
          updated_at: item.updated_at
        })) : []
      })) as Invoice[];

      setInvoices(invoicesData);
      
      logger.info('Invoices processed successfully', { 
        count: invoicesData.length,
        itemsCount: invoicesData.reduce((sum, invoice) => sum + invoice.items.length, 0)
      });

      // Update cache
      const newCache = { ...invoiceCache };
      invoicesData.forEach(invoice => {
        newCache[invoice.id] = invoice;
      });
      setInvoiceCache(newCache);

      return invoicesData;
    } catch (err) {
      const error = err as Error;
      logger.error('Failed to fetch invoices', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, invoiceCache]);

  const fetchInvoice = useCallback(async (id: string): Promise<Invoice> => {
    if (!user) {
      logger.error('Attempted to fetch invoice without user', { id });
      throw new Error('Authentication required');
    }
    
    logger.info('Starting to fetch invoice', { id, userId: user.id });

    // Check cache first
    if (invoiceCache[id]) {
      logger.info('Invoice found in cache', { id });
      return invoiceCache[id];
    }

    try {
      logger.info('Fetching invoice from database', { id, userId: user.id });
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(
            id,
            invoice_id,
            name,
            description,
            quantity,
            rate,
            amount,
            created_at,
            updated_at
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        logger.error('Database error while fetching invoice', { error, id, userId: user.id });
        throw error;
      }

      if (!data) {
        logger.error('No invoice found', { id, userId: user.id });
        throw new Error('Invoice not found');
      }

      // Log raw data
      logger.info('Raw invoice data from database:', {
        id,
        hasItems: !!data.items,
        itemsArray: Array.isArray(data.items),
        itemsLength: data.items?.length,
        rawItems: data.items
      });

      // Ensure items is always an array and map to consistent structure
      const invoice = {
        ...data,
        items: Array.isArray(data.items) ? data.items.map((item: InvoiceItem) => {
          // Log each item being processed
          logger.info('Processing invoice item:', { item });
          
          return {
            id: item.id,
            invoice_id: item.invoice_id,
            name: item.name || '',
            description: item.description || '',
            quantity: Number(item.quantity) || 0,
            rate: Number(item.rate) || 0,
            amount: Number(item.amount) || 0,
            created_at: item.created_at,
            updated_at: item.updated_at
          };
        }) : []
      } as Invoice;

      // Log processed invoice
      logger.info('Processed invoice data:', { 
        id, 
        userId: user.id,
        itemsCount: invoice.items?.length || 0,
        processedItems: invoice.items
      });

      // Update cache
      setInvoiceCache(prev => ({
        ...prev,
        [id]: invoice
      }));

      return invoice;
    } catch (err) {
      const error = err as Error;
      logger.error('Failed to fetch invoice', { error, id, userId: user.id });
      throw error;
    }
  }, [user, invoiceCache]);

  useEffect(() => {
    if (user) {
      fetchInvoices().catch(err => {
        logger.error('Failed to fetch invoices in useEffect', err);
      });
    }
  }, [user]);

  const createInvoice = async (
    formData: InvoiceFormData,
    showDiscount: boolean,
    showTax: boolean,
    showShipping: boolean,
    paymentMethod: string,
    totals: {
      subtotal: number;
      discount: number;
      tax: number;
      shipping: number;
      total: number;
    }
  ) => {
    try {
      setLoading(true);
      
      // Log the input data
      logger.info('Creating invoice with data:', { 
        formData,
        showDiscount,
        showTax,
        showShipping,
        paymentMethod,
        totals
      });

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        logger.error('User auth error:', userError);
        throw userError;
      }
      if (!user) {
        logger.error('No user found');
        throw new Error('No user found');
      }

      // Format dates to ISO string
      const issueDate = new Date(formData.issueDate).toISOString();
      const dueDate = formData.dueDate ? new Date(formData.dueDate).toISOString() : null;

      // Validate required fields
      if (!formData.invoiceNumber) {
        throw new Error('Invoice number is required');
      }
      if (!formData.to.name) {
        throw new Error('Customer name is required');
      }

      // Log the invoice data being sent
      const invoiceData = {
        user_id: user.id,
        invoice_number: formData.invoiceNumber,
        issue_date: issueDate,
        due_date: dueDate,
        currency: formData.currency,
        payment_method: paymentMethod,
        payment_terms: formData.paymentTerms,
        additional_notes: formData.additionalNotes,
        status: 'draft',
        // Billing Info
        billing_name: formData.to.name,
        billing_email: formData.to.email,
        billing_phone: formData.to.phone,
        billing_address: formData.to.address,
        billing_city: formData.to.city,
        billing_zip: formData.to.zip,
        billing_country: formData.to.country,
        // Adjustments
        discount_value: showDiscount ? formData.adjustments.discount.value : 0,
        discount_type: formData.adjustments.discount.type,
        tax_value: showTax ? formData.adjustments.tax.value : 0,
        tax_type: formData.adjustments.tax.type,
        shipping_value: showShipping ? formData.adjustments.shipping.value : 0,
        shipping_type: formData.adjustments.shipping.type,
        // Totals
        subtotal: totals.subtotal,
        total: totals.total
      };

      logger.info('Creating invoice record:', invoiceData);

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (invoiceError) {
        logger.error('Failed to create invoice record:', invoiceError);
        throw invoiceError;
      }

      if (!invoice) {
        logger.error('No invoice data returned after creation');
        throw new Error('Failed to create invoice');
      }

      // Create invoice items with proper field mapping
      const invoiceItems = formData.items.map(item => ({
        invoice_id: invoice.id,
        name: item.name || '',
        description: item.description || '',
        quantity: Number(item.quantity) || 0,
        rate: Number(item.rate) || 0,
        amount: (Number(item.quantity) || 0) * (Number(item.rate) || 0)
      }));

      logger.info('Creating invoice items:', { items: invoiceItems });

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) {
        logger.error('Failed to create invoice items:', itemsError);
        // If items creation fails, we should delete the invoice
        await supabase.from('invoices').delete().eq('id', invoice.id);
        throw itemsError;
      }

      logger.success('Invoice created successfully', { 
        invoiceId: invoice.id,
        itemsCount: invoiceItems.length 
      });
      
      return invoice;
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to create invoice', { 
        error: err.message,
        stack: err.stack,
        name: err.name 
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (
    id: string,
    formData: InvoiceFormData,
    showDiscount: boolean,
    showTax: boolean,
    showShipping: boolean,
    paymentMethod: string,
    totals: {
      subtotal: number;
      discount: number;
      tax: number;
      shipping: number;
      total: number;
    }
  ) => {
    try {
      setLoading(true);

      // Log the input data
      logger.info('Updating invoice with data:', { 
        id,
        formData,
        showDiscount,
        showTax,
        showShipping,
        paymentMethod,
        totals
      });

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        logger.error('User auth error:', userError);
        throw userError;
      }
      if (!user) {
        logger.error('No user found');
        throw new Error('No user found');
      }

      // Format dates to ISO string
      const issueDate = new Date(formData.issueDate).toISOString();
      const dueDate = formData.dueDate ? new Date(formData.dueDate).toISOString() : null;

      // Validate required fields
      if (!formData.invoiceNumber) {
        throw new Error('Invoice number is required');
      }
      if (!formData.to.name) {
        throw new Error('Customer name is required');
      }

      // Log the invoice data being sent
      const invoiceData = {
        invoice_number: formData.invoiceNumber,
        issue_date: issueDate,
        due_date: dueDate,
        currency: formData.currency,
        payment_method: paymentMethod,
        payment_terms: formData.paymentTerms,
        additional_notes: formData.additionalNotes,
        // Billing Info
        billing_name: formData.to.name,
        billing_email: formData.to.email,
        billing_phone: formData.to.phone,
        billing_address: formData.to.address,
        billing_city: formData.to.city,
        billing_zip: formData.to.zip,
        billing_country: formData.to.country,
        // Adjustments
        discount_value: showDiscount ? formData.adjustments.discount.value : 0,
        discount_type: formData.adjustments.discount.type,
        tax_value: showTax ? formData.adjustments.tax.value : 0,
        tax_type: formData.adjustments.tax.type,
        shipping_value: showShipping ? formData.adjustments.shipping.value : 0,
        shipping_type: formData.adjustments.shipping.type,
        // Totals
        subtotal: totals.subtotal,
        total: totals.total
      };

      logger.info('Updating invoice record:', { id, data: invoiceData });

      // Update invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (invoiceError) {
        logger.error('Failed to update invoice record:', invoiceError);
        throw invoiceError;
      }

      if (!invoice) {
        logger.error('No invoice data returned after update');
        throw new Error('Failed to update invoice');
      }

      // Delete existing items
      logger.info('Deleting existing invoice items', { invoiceId: id });
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      if (deleteError) {
        logger.error('Failed to delete existing invoice items:', deleteError);
        throw deleteError;
      }

      // Create new invoice items
      const invoiceItems = formData.items.map(item => ({
        invoice_id: id,
        name: item.name || '',
        description: item.description || '',
        quantity: Number(item.quantity) || 0,
        rate: Number(item.rate) || 0,
        amount: (Number(item.quantity) || 0) * (Number(item.rate) || 0)
      }));

      logger.info('Creating new invoice items:', { items: invoiceItems });

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) {
        logger.error('Failed to create new invoice items:', itemsError);
        throw itemsError;
      }

      logger.success('Invoice updated successfully', { 
        invoiceId: id,
        itemsCount: invoiceItems.length 
      });
      
      return invoice;
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to update invoice', { 
        error: err.message,
        stack: err.stack,
        name: err.name 
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      setLoading(true);
      logger.info('Deleting invoice', { id });

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        logger.error('User auth error:', userError);
        throw userError;
      }
      if (!user) {
        logger.error('No user found');
        throw new Error('No user found');
      }

      // Delete invoice (invoice_items will be deleted automatically due to ON DELETE CASCADE)
      const { error: deleteError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        logger.error('Failed to delete invoice:', deleteError);
        throw deleteError;
      }

      // Remove from cache
      setInvoiceCache(prev => {
        const newCache = { ...prev };
        delete newCache[id];
        return newCache;
      });

      // Remove from invoices list
      setInvoices(prev => prev.filter(invoice => invoice.id !== id));

      logger.success('Invoice deleted successfully', { id });
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to delete invoice', { 
        error: err.message,
        stack: err.stack,
        name: err.name 
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    invoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    fetchInvoices,
    fetchInvoice,
    loading,
    error
  };
}; 