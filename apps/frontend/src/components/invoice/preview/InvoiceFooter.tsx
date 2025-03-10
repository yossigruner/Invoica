import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { ProfileData } from "../types/invoice";
import { handleCreditCardPayment } from "../utils/invoiceUtils";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

interface InvoiceFooterProps {
  profileData: ProfileData | null;
  additionalNotes: string;
  paymentTerms: string;
  signature?: string | null;
  paymentMethod?: string;
  invoiceNumber?: string;
  amount?: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
}

export const InvoiceFooter = ({
  profileData,
  additionalNotes,
  paymentTerms,
  signature,
  paymentMethod = "bank",
  invoiceNumber = "",
  amount = 0,
  currency = "USD",
  customerEmail = "",
  customerName = ""
}: InvoiceFooterProps) => {
  const handlePayment = async () => {
    try {
      await handleCreditCardPayment({
        invoiceNumber,
        amount,
        currency,
        customerEmail,
        customerName
      });
      toast.success("Payment initiated successfully!");
    } catch (error) {
      logger.error('Payment initiation failed:', error);
      toast.error("Failed to initiate payment");
    }
  };

  return (
    <div className="space-y-6">
      {paymentMethod === "bank" && profileData && (
        <div className="pt-4 border-t">
          <h4 className="font-semibold">Bank Details:</h4>
          <div className="text-sm space-y-1 mt-2">
            <p><span className="text-gray-600">Bank Name:</span> {profileData.bankName || 'N/A'}</p>
            <p><span className="text-gray-600">Account Name:</span> {profileData.accountName || 'N/A'}</p>
            <p><span className="text-gray-600">Account Number:</span> {profileData.accountNumber || 'N/A'}</p>
            {profileData.swiftCode && (
              <p><span className="text-gray-600">Swift Code:</span> {profileData.swiftCode}</p>
            )}
            {profileData.iban && (
              <p><span className="text-gray-600">IBAN:</span> {profileData.iban}</p>
            )}
          </div>
        </div>
      )}

      {additionalNotes && (
        <div className="pt-4 border-t">
          <h4 className="font-semibold">Additional Notes:</h4>
          <p className="text-sm whitespace-pre-wrap mt-2">{additionalNotes}</p>
        </div>
      )}

      {paymentTerms && (
        <div className="pt-4 border-t">
          <h4 className="font-semibold">Payment Terms:</h4>
          <p className="text-sm whitespace-pre-wrap mt-2">{paymentTerms}</p>
        </div>
      )}

      {signature && (
        <div className="pt-4 border-t">
          <h4 className="font-semibold">Signature:</h4>
          <div className="mt-2">
            <img src={signature} alt="Signature" className="max-h-20" />
          </div>
        </div>
      )}

      {profileData && (
        <div className="pt-4 border-t">
          <div className="text-sm space-y-1">
            <p className="text-gray-600">If you have any questions concerning this invoice, use the following contact information:</p>
            <p>{profileData.email}</p>
            <p>{profileData.phone}</p>
          </div>
        </div>
      )}

      {paymentMethod === "card" && (
        <div className="pt-4 border-t">
          <Button 
            onClick={handlePayment}
            className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2 py-6 rounded-lg"
          >
            <CreditCard className="h-5 w-5" />
            Pay Invoice
          </Button>
        </div>
      )}
    </div>
  );
};
