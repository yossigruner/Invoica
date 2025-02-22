import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface ProfileData {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  swiftCode?: string;
  iban?: string;
  email: string;
  phone: string;
}

interface InvoiceFooterProps {
  profileData: ProfileData | null;
  additionalNotes?: string;
  paymentTerms?: string;
  totalInWords: string;
  signature?: string | null;
  paymentMethod?: string;
}

export const InvoiceFooter = ({
  profileData,
  additionalNotes,
  paymentTerms,
  totalInWords,
  signature,
  paymentMethod,
}: InvoiceFooterProps) => {
  return (
    <div className="space-y-2 avoid-break">
      <div className="text-right italic text-gray-600 text-sm mb-2">
        <p>Total in words: {totalInWords}</p>
      </div>

      {paymentMethod === "bank" && profileData?.bankName && (
        <div className="border-t pt-2">
          <h3 className="font-semibold mb-1 text-sm">Please send the payment to this address:</h3>
          <div className="space-y-0.5 text-xs text-gray-600">
            <p><span className="text-gray-500">Bank:</span> {profileData.bankName}</p>
            <p><span className="text-gray-500">Account name:</span> {profileData.accountName}</p>
            <p><span className="text-gray-500">Account no:</span> {profileData.accountNumber}</p>
            {profileData.swiftCode && (
              <p><span className="text-gray-500">SWIFT/BIC:</span> {profileData.swiftCode}</p>
            )}
            {profileData.iban && (
              <p><span className="text-gray-500">IBAN:</span> {profileData.iban}</p>
            )}
          </div>
        </div>
      )}
      
      {additionalNotes && (
        <div className="border-t pt-2">
          <h3 className="font-semibold mb-1 text-sm">Additional notes:</h3>
          <p className="text-xs text-gray-600">{additionalNotes}</p>
        </div>
      )}

      {paymentTerms && (
        <div className="border-t pt-2">
          <h3 className="font-semibold mb-1 text-sm">Payment terms:</h3>
          <p className="text-xs text-gray-600">{paymentTerms}</p>
        </div>
      )}

      <div className="border-t pt-2">
        <p className="text-xs text-gray-600 mb-2">
          If you have any questions concerning this invoice, use the following contact information:
        </p>
        {profileData && (
          <div className="text-xs text-gray-600">
            <p>{profileData.email}</p>
            <p>{profileData.phone}</p>
          </div>
        )}
      </div>

      {signature && (
        <div className="border-t pt-2">
          <h3 className="font-semibold mb-1 text-sm">Signature:</h3>
          <div className="max-w-[150px]">
            <img src={signature} alt="Signature" className="w-full" />
          </div>
        </div>
      )}

      {paymentMethod === "card" && (
        <div className="border-t pt-4">
          <Button className="w-full py-4 text-base" size="lg">
            <CreditCard className="mr-2 h-4 w-4" />
            Pay Invoice
          </Button>
        </div>
      )}
    </div>
  );
};
