import { InvoicePreviewHeader } from "./InvoicePreviewHeader";
import { InvoicePreviewContent } from "./InvoicePreviewContent";
import { InvoiceFooter } from "./InvoiceFooter";
import { InvoiceActions } from "../InvoiceActions";
import { Card } from "@/components/ui/card";
import { InvoiceFormItem, ProfileData } from "../types/invoice";
import { logger } from "@/utils/logger";
import { InvoicePreview } from "../InvoicePreview";
import { InvoiceFormData } from "../types/invoice";

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
  profileData: ProfileData | null;
  formData: InvoiceFormData;
  showDiscount: boolean;
  showTax: boolean;
  showShipping: boolean;
  calculateTotal: () => {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

export const InvoicePreviewContainer = ({
  profileData,
  formData,
  showDiscount,
  showTax,
  showShipping,
  calculateTotal,
}: InvoicePreviewContainerProps) => {
  if (!profileData) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
      <div id="invoice-preview" className="bg-white">
        <InvoicePreview
          formData={formData}
          showDiscount={showDiscount}
          showTax={showTax}
          showShipping={showShipping}
          profileData={profileData}
          calculateTotal={calculateTotal}
        />
      </div>
    </div>
  );
};
