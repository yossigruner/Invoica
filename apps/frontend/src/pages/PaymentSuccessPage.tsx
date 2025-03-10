import { useParams, Link } from "react-router-dom";
import { usePublicInvoice } from "@/hooks/usePublicInvoice";
import { Loading } from "@/components/ui/loading";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PaymentSuccessPage = () => {
  const { id } = useParams();
  const { invoice, isLoading, error } = usePublicInvoice(id || "");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading payment details..." />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Payment Verification Failed</h1>
          <p className="mt-2 text-gray-600">We couldn't verify your payment at this time.</p>
          <Button asChild className="mt-4">
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="mt-2 text-gray-600">Thank you for your payment</p>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-600">Invoice Number</dt>
              <dd className="text-sm text-gray-900">{invoice.invoiceNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-600">Amount Paid</dt>
              <dd className="text-sm text-gray-900">{invoice.total.toFixed(2)} {invoice.currency}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-600">Date</dt>
              <dd className="text-sm text-gray-900">{new Date().toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            A receipt has been sent to {invoice.billingEmail}
          </p>
          <Button asChild className="mt-4 w-full">
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}; 