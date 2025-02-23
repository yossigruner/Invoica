import { InvoicePreviewHeader } from "./InvoicePreviewHeader";
import { InvoiceBillingInfo } from "./InvoiceBillingInfo";
import { InvoiceFooter } from "./InvoiceFooter";
import { InvoiceActions } from "../InvoiceActions";
import { Card } from "@/components/ui/card";
import { InvoicePreviewContent } from "./InvoicePreviewContent";
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

  const formatTotalInWords = (amount: number) => {
    return `${amount.toFixed(2)} ${formData.currency}`;
  };

  const totals = calculateTotal();
  const totalInWords = formatTotalInWords(totals.total);

  return (
    <div className="space-y-6">
      <Card className="p-4 shadow-lg bg-white/80 backdrop-blur-sm border-0">
        <InvoiceActions 
          formData={formData}
          showDiscount={formData.adjustments.discount.value > 0}
          showTax={formData.adjustments.tax.value > 0}
          showShipping={formData.adjustments.shipping.value > 0}
          paymentMethod={formData.paymentMethod || ''}
          calculateTotal={calculateTotal}
          isEditing={isEditing}
          initialData={initialData}
        />
      </Card>

      <div className="flex items-center gap-2 pb-2 border-b">
        <h2 className="text-lg font-semibold">Live Preview</h2>
        <span className="text-sm text-muted-foreground">
          (Updates in real-time as you edit)
        </span>
      </div>

      <Card className="p-8 shadow-lg bg-white/80 backdrop-blur-sm border-0" id="invoice-preview">
        <div className="invoice-preview space-y-8">
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
          />

        </div>
      </Card>
    </div>
  );
};
