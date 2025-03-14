import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import type { Invoice } from '@/types';
import { invoicesApi } from '@/api/invoices';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  PencilIcon, 
  TrashIcon, 
  DocumentArrowDownIcon, 
  EnvelopeIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';

export default function InvoiceList() {
  const navigate = useNavigate();
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.getAll()
  });

  const invoices = data?.data || [];

  const handleSendEmail = async (invoice: Invoice) => {
    try {
      setSendingEmail(invoice.id);
      await invoicesApi.sendInvoice(invoice.id);
      toast.success('Invoice sent successfully');
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    } finally {
      setSendingEmail(null);
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      const blob = await invoicesApi.downloadPdf(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <div>Error loading invoices</div>;
  }

  const getBadgeVariant = (status: string): 'default' | 'destructive' | 'secondary' | 'outline' => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'secondary';
      case 'pending':
      case 'sent':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
        <Button onClick={() => navigate('/invoices/new')}>
          <PlusIcon className="w-5 h-5 mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice: Invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.invoice_number}</td>
                <td>
                  {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
                </td>
                <td>{invoice.billing_name}</td>
                <td>
                  {invoice.currency} {invoice.total.toFixed(2)}
                </td>
                <td>
                  <Badge variant={getBadgeVariant(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </td>
                <td>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                      className="text-gray-600 hover:text-purple-600"
                      title="Edit Invoice"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(invoice)}
                      className="text-gray-600 hover:text-purple-600"
                      title="Download PDF"
                    >
                      <DocumentArrowDownIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleSendEmail(invoice)}
                      disabled={sendingEmail === invoice.id}
                      className={`text-gray-600 hover:text-purple-600 ${
                        sendingEmail === invoice.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Send Invoice"
                    >
                      {sendingEmail === invoice.id ? (
                        <Spinner className="w-5 h-5" />
                      ) : (
                        <EnvelopeIcon className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this invoice?')) {
                          // Handle delete
                        }
                      }}
                      className="text-gray-600 hover:text-red-600"
                      title="Delete Invoice"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
} 