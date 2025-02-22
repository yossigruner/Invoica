import { useState, useEffect } from 'react';
import { supabase } from '@/db/config';
import { logger } from '@/utils/logger';
import { InvoiceFormData } from '@/components/invoice/types/invoice';

export interface Invoice {
  id: string;
  user_id: string;
  customer_id: string | null;
  invoice_number: string;
  issue_date: string;
  due_date: string | null;
  currency: string;
  payment_method: string | null;
  payment_terms: string | null;
  additional_notes: string | null;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  billing_name: string;
  billing_email: string | null;
  billing_phone: string | null;
  billing_address: string | null;
  billing_city: string | null;
  billing_zip: string | null;
  billing_country: string | null;
  discount_value: number;
  discount_type: 'amount' | 'percentage' | null;
  tax_value: number;
  tax_type: 'amount' | 'percentage' | null;
  shipping_value: number;
  shipping_type: 'amount' | 'percentage' | null;
  subtotal: number;
  total: number;
  created_at: string;
  updated_at: string;
}

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
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const fetchInvoices = async () => {
    try {
      console.log('Fetching invoices...');
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      console.log('User found:', user.id);

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }

      console.log('Invoices fetched:', data?.length);
      setInvoices(data || []);
      logger.info('Invoices fetched successfully', { count: data?.length });
      return data;
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      logger.error('Failed to fetch invoices', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoice = async (id: string) => {
    try {
      logger.info('Starting to fetch invoice', { id });
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        logger.error('Failed to get user', userError);
        throw userError;
      }
      if (!user) {
        logger.error('No user found');
        throw new Error('No user found');
      }

      logger.info('Fetching invoice from database', { id, userId: user.id });
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (invoiceError) {
        logger.error('Failed to fetch invoice from database', { error: invoiceError });
        throw invoiceError;
      }

      if (!invoice) {
        logger.error('Invoice not found', { id });
        throw new Error('Invoice not found');
      }

      logger.success('Invoice fetched successfully', { id, invoice });
      return invoice;
    } catch (error) {
      logger.error('Failed to fetch invoice', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoices on mount
  useEffect(() => {
    fetchInvoices();
  }, []);

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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Format dates to ISO string
      const issueDate = new Date(formData.issueDate).toISOString();
      const dueDate = formData.dueDate ? new Date(formData.dueDate).toISOString() : null;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([
          {
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
          }
        ])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const invoiceItems = formData.items.map(item => ({
        invoice_id: invoice.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: Number(item.quantity) * Number(item.rate)
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      logger.success('Invoice created successfully', { invoiceId: invoice.id });
      return invoice;
    } catch (error) {
      logger.error('Failed to create invoice', error);
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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Format dates to ISO string
      const issueDate = new Date(formData.issueDate).toISOString();
      const dueDate = formData.dueDate ? new Date(formData.dueDate).toISOString() : null;

      // Update invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .update({
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
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      if (deleteError) throw deleteError;

      // Create new invoice items
      const invoiceItems = formData.items.map(item => ({
        invoice_id: id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: Number(item.quantity) * Number(item.rate)
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      logger.success('Invoice updated successfully', { invoiceId: id });
      return invoice;
    } catch (error) {
      logger.error('Failed to update invoice', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    invoices,
    createInvoice,
    updateInvoice,
    fetchInvoices,
    fetchInvoice,
    loading
  };
}; 