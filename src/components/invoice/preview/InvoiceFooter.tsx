import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { ProfileData } from "../types/invoice";

interface InvoiceFooterProps {
  profileData: ProfileData | null;
  additionalNotes: string;
  paymentTerms: string;
  signature?: string | null;
  paymentMethod?: string;
}

export const InvoiceFooter = ({
  profileData,
  additionalNotes,
  paymentTerms,
  signature,
  paymentMethod = "bank"
}: InvoiceFooterProps) => {
  return (
    <div className="space-y-6">
      {paymentMethod === "bank" && profileData && (
        <div className="space-y-2">
          <h4 className="font-semibold">Bank Details:</h4>
          <div className="text-sm space-y-1">
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
        <div className="space-y-2">
          <h4 className="font-semibold">Additional Notes:</h4>
          <p className="text-sm whitespace-pre-wrap">{additionalNotes}</p>
        </div>
      )}

      {paymentTerms && (
        <div className="space-y-2">
          <h4 className="font-semibold">Payment Terms:</h4>
          <p className="text-sm whitespace-pre-wrap">{paymentTerms}</p>
        </div>
      )}

      {signature && (
        <div className="space-y-2">
          <h4 className="font-semibold">Signature:</h4>
          <img src={signature} alt="Signature" className="max-h-20" />
        </div>
      )}

      {profileData && (
        <div className="space-y-2">
          <h4 className="font-semibold">Contact Information:</h4>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-600">If you have any questions concerning this invoice, use the following contact information:</span></p>
            <p><span className="text-gray-600">Email:</span> {profileData.email}</p>
            <p><span className="text-gray-600">Phone:</span> {profileData.phone}</p>
          </div>
        </div>
      )}
    </div>
  );
};
