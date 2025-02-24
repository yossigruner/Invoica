import { InvoicePreview } from "./InvoicePreview";
import { InvoiceFormData, ProfileData } from "./types/invoice";

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
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <InvoicePreview
        formData={formData}
        showDiscount={showDiscount}
        showTax={showTax}
        showShipping={showShipping}
        profileData={profileData}
        calculateTotal={calculateTotal}
      />
    </div>
  );
}; 