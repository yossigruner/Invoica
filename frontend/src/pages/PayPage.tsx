import { useParams } from "react-router-dom";
import { usePublicInvoice } from "@/hooks/usePublicInvoice";
import { Loading } from "@/components/ui/loading";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { invoicesApi } from "@/api/invoices";

export const PayPage = () => {
  const { id } = useParams();
  const { invoice, isLoading, error } = usePublicInvoice(id || "");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading invoice..." />
      </div>
    );
  }

  if (error) {
    logger.error('Failed to load invoice', error);
    toast.error("Failed to load invoice");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">Failed to load invoice</h3>
          <p className="text-sm text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">Invoice not found</h3>
          <p className="text-sm text-gray-500">The invoice you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  const calculateTotal = () => {
    const subtotal = invoice.items.reduce((total, item) => {
      return total + (Number(item.quantity) * Number(item.rate));
    }, 0);

    const discountAmount = invoice.discountValue ? 
      (invoice.discountType === 'percentage' ? (invoice.discountValue / 100) * subtotal : invoice.discountValue) : 0;

    const taxAmount = invoice.taxValue ? 
      (invoice.taxType === 'percentage' ? (invoice.taxValue / 100) * (subtotal - discountAmount) : invoice.taxValue) : 0;

    const shippingAmount = invoice.shippingValue || 0;

    return {
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      shipping: shippingAmount,
      total: subtotal - discountAmount + taxAmount + shippingAmount
    };
  };

  const handlePayment = async () => {
    try {
      const { href } = await invoicesApi.generatePaymentLink(id || "");
      // Redirect to Clover's payment page
      console.log('Redirecting to payment URL:', href);
      window.location.href = href;
    } catch (error) {
      logger.error('Payment failed:', error);
      toast.error("Failed to initiate payment");
    }
  };

  const totals = calculateTotal();

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* Left Panel */}
      <div className="bg-[#8B5CF6] p-8 flex flex-col justify-center text-white relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full" />
          <div className="absolute bottom-0 right-0 w-60 h-60 translate-x-1/2 translate-y-1/2 bg-white rounded-full" />
        </div>
        
        <div className="max-w-md mx-auto w-full flex flex-col items-center justify-center text-center relative z-10 space-y-8">
          {/* Logo and branding at the top */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-medium">Invoice Payment</h1>
              <p className="text-white/80">Secure payment processing</p>
            </div>
            <div className="pt-2 border-t border-white/20">
              <h2 className="text-3xl font-bold tracking-tight">Invoica</h2>
              <p className="text-white/60 text-sm">Professional Invoicing</p>
            </div>
          </div>

          <div className="w-full space-y-4">
            <span className="text-white/80 text-xl">Amount Due</span>
            <div className="space-y-2">
              <span className="text-6xl font-bold block">{totals.total.toFixed(2)}</span>
              <span className="text-2xl text-white/90 block">{invoice.currency}</span>
            </div>
          </div>

          {/* Security badges and branding at the bottom */}
          <div className="pt-8 w-full">
            <div className="border-t border-white/20 pt-4 space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/90 text-sm">Secure Payment Processing</span>
              </div>
              <div className="text-white/60 text-xs">
                Powered by <span className="font-semibold text-white">Invoica</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Invoice Details & Payment Form */}
      <div className="p-8 flex flex-col justify-center bg-white">
        <div className="max-w-md mx-auto w-full space-y-8">
          {/* Invoice Details */}
          <div className="space-y-6 pb-8 border-b">
            <div>
              <h2 className="text-2xl font-bold mb-2">Invoice #{invoice.invoiceNumber}</h2>
              <p className="text-gray-500">Due {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span>{totals.subtotal.toFixed(2)} {invoice.currency}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between items-center text-gray-600">
                  <span>Discount</span>
                  <span>-{totals.discount.toFixed(2)} {invoice.currency}</span>
                </div>
              )}
              {totals.tax > 0 && (
                <div className="flex justify-between items-center text-gray-600">
                  <span>Tax</span>
                  <span>+{totals.tax.toFixed(2)} {invoice.currency}</span>
                </div>
              )}
              {totals.shipping > 0 && (
                <div className="flex justify-between items-center text-gray-600">
                  <span>Shipping</span>
                  <span>+{totals.shipping.toFixed(2)} {invoice.currency}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">{totals.total.toFixed(2)} {invoice.currency}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <Button 
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-6 text-lg"
              onClick={handlePayment}
            >
              Pay {totals.total.toFixed(2)} {invoice.currency}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              By confirming your payment, you allow us to charge your card for this payment and future payments in accordance with our terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 