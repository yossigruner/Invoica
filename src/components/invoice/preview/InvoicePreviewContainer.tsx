import { InvoicePreviewHeader } from "./InvoicePreviewHeader";
import { InvoicePreviewContent } from "./InvoicePreviewContent";
import { InvoiceFooter } from "./InvoiceFooter";
import { InvoiceActions } from "../InvoiceActions";
import { Card } from "@/components/ui/card";
import { InvoiceFormItem, ProfileData } from "../types/invoice";
import { logger } from "@/utils/logger";

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  paymentMethod: string;
  to: {
    name: string;
    address: string;
    zip: string;
    city: string;
    country: string;
    email: string;
    phone: string;
  };
  items: InvoiceFormItem[];
  additionalNotes: string;
  paymentTerms: string;
  adjustments: {
    discount: { value: number; type: 'amount' | 'percentage' };
    tax: { value: number; type: 'amount' | 'percentage' };
    shipping: { value: number; type: 'amount' | 'percentage' };
  };
}

interface InvoicePreviewContainerProps {
  formData: InvoiceData;
  profileData: ProfileData;
  logo: string | null;
  signature: string | null;
  calculateTotal: () => {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  isEditing?: boolean;
  initialData?: { id: string } | null;
}

export const InvoicePreviewContainer = ({
  formData,
  profileData,
  logo,
  signature,
  calculateTotal,
  isEditing,
  initialData
}: InvoicePreviewContainerProps) => {
  logger.info('Rendering invoice preview container', {
    hasLogo: !!logo,
    logoValue: logo,
    hasSignature: !!signature,
    signatureValue: signature,
    hasProfileData: !!profileData,
    profileData
  });

  const totals = calculateTotal();

  return (
    <div className="invoice-preview max-w-4xl mx-auto">
      <div id="invoice-preview" className="space-y-4 scale-[0.95] origin-top">
        <InvoicePreviewHeader
          logo={logo}
          invoiceNumber={formData.invoiceNumber}
          profileData={profileData}
          issueDate={formData.issueDate}
          dueDate={formData.dueDate}
          currency={formData.currency}
        />

        <InvoicePreviewContent
          items={formData.items}
          currency={formData.currency}
          totals={totals}
          to={formData.to}
        />

        <InvoiceFooter
          profileData={profileData}
          additionalNotes={formData.additionalNotes}
          paymentTerms={formData.paymentTerms}
          signature={signature}
          paymentMethod={formData.paymentMethod}
          invoiceNumber={formData.invoiceNumber}
          amount={totals.total}
          currency={formData.currency}
          customerEmail={formData.to.email}
          customerName={formData.to.name}
        />
      </div>
    </div>
  );
};
