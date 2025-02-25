import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { InvoiceFormItem, ProfileData } from "./types/invoice";
import { formatAmountInWords } from "./utils/invoiceUtils";
import { logger } from "@/utils/logger";

interface InvoicePreviewProps {
  formData: {
    invoiceNumber?: string;
    issueDate?: string;
    dueDate?: string;
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
    currency: string;
    paymentTerms: string;
    additionalNotes?: string;
    adjustments: {
      discount: { value: number; type: "amount" | "percentage" };
      tax: { value: number; type: "amount" | "percentage" };
      shipping: { value: number; type: "amount" | "percentage" };
    };
    paymentMethod: string;
  };
  showDiscount?: boolean;
  showTax?: boolean;
  showShipping?: boolean;
  profileData: ProfileData | null;
  calculateTotal: () => {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  logo?: string | null;
  signature?: string | null;
}

export const InvoicePreview = ({ 
  formData, 
  showDiscount, 
  showTax, 
  showShipping, 
  profileData,
  calculateTotal,
  logo,
  signature
}: InvoicePreviewProps) => {
  if (!profileData) {
    return (
      <div className="h-[29.7cm] w-full bg-white p-6">
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500">Loading profile data...</p>
        </div>
      </div>
    );
  }

  const { subtotal, discount, tax, shipping, total } = calculateTotal();

  const getImageSrc = (imageData: string | null | undefined): string | undefined => {
    if (!imageData) return undefined;

    try {
      if (imageData.startsWith('data:')) {
        return imageData;
      }

      if (imageData.startsWith('/')) {
        const baseUrl = import.meta.env.VITE_API_URL || '';
        return `${baseUrl}${imageData}`;
      }

      if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
        return imageData;
      }

      return `data:image/png;base64,${imageData}`;
    } catch (error) {
      return undefined;
    }
  };

  const renderLogo = () => {
    const logoData = logo || profileData?.companyLogo;
    if (!logoData) return null;

    const logoSrc = getImageSrc(logoData);
    if (!logoSrc) return null;

    return (
      <div className="relative w-32">
        <img 
          src={logoSrc}
          alt={profileData.name || 'Company Logo'} 
          className="w-full h-auto object-contain"
          style={{ maxHeight: '48px', minHeight: '14px' }}
        />
      </div>
    );
  };

  return (
    <div className="h-[29.7cm] w-full bg-white">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            {renderLogo()}
            <div className="text-sm text-gray-600 space-y-0.5 mt-2">
              <p>{profileData.name}</p>
              <p>{profileData.address}</p>
              <p>{profileData.city}, {profileData.zip}</p>
              <p>{profileData.country}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice #{formData.invoiceNumber || '_______'}</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>Issue date: {formData.issueDate ? format(new Date(formData.issueDate), 'MMMM dd, yyyy') : 'Select date'}</p>
              <p>Due date: {formData.dueDate ? format(new Date(formData.dueDate), 'MMMM dd, yyyy') : 'Select date'}</p>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="mb-6">
          <h3 className="text-gray-600 font-medium mb-2">Bill to:</h3>
          <div className="text-sm space-y-0.5">
            <p className="font-semibold text-gray-900">{formData.to.name}</p>
            <p className="text-gray-600">{formData.to.address}</p>
            <p className="text-gray-600">{formData.to.city}, {formData.to.zip}, {formData.to.country}</p>
            <p className="text-gray-600">{formData.to.email}</p>
            <p className="text-gray-600">{formData.to.phone}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600 font-medium">ITEM</th>
                <th className="text-center py-2 text-gray-600 font-medium">QTY</th>
                <th className="text-right py-2 text-gray-600 font-medium">RATE</th>
                <th className="text-right py-2 text-gray-600 font-medium">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {formData.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-2">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500">{item.description}</div>
                    )}
                  </td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">{item.rate.toFixed(2)} {formData.currency}</td>
                  <td className="text-right py-2">{(item.quantity * item.rate).toFixed(2)} {formData.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="space-y-2 border-t pt-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{subtotal.toFixed(2)} {formData.currency}</span>
          </div>
          
          {showDiscount && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Discount ({formData.adjustments.discount.type === 'percentage' ? 
                `${formData.adjustments.discount.value}%` : 
                `${formData.adjustments.discount.value} ${formData.currency}`}):
              </span>
              <span>-{discount.toFixed(2)} {formData.currency}</span>
            </div>
          )}
          
          {showTax && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({formData.adjustments.tax.type === 'percentage' ? 
                `${formData.adjustments.tax.value}%` : 
                `${formData.adjustments.tax.value} ${formData.currency}`}):
              </span>
              <span>+{tax.toFixed(2)} {formData.currency}</span>
            </div>
          )}
          
          {showShipping && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping:</span>
              <span>+{shipping.toFixed(2)} {formData.currency}</span>
            </div>
          )}
          
          <div className="flex justify-between pt-2 border-t font-medium">
            <span>Total:</span>
            <span>{total.toFixed(2)} {formData.currency}</span>
          </div>
        </div>

        {/* Total in Words */}
        <div className="mt-4 text-sm text-gray-600">
          <p>Total in words: {formatAmountInWords(total, formData.currency)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Payment Details - Only show for bank transfer */}
          {formData.paymentMethod === 'bank' && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Payment Details:</h4>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p>Bank: {profileData?.bankName}</p>
                <p>Account name: {profileData?.accountName}</p>
                <p>Account no: {profileData?.accountNumber}</p>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className={formData.paymentMethod === 'bank' ? '' : 'col-span-2'}>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Contact Information:</h4>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>{profileData?.email}</p>
              <p>{profileData?.phone}</p>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        {formData.additionalNotes && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Additional notes:</h4>
            <p className="text-sm text-gray-600">{formData.additionalNotes}</p>
          </div>
        )}

        {/* Signature Section */}
        {(signature || profileData?.signature) && (
          <div className="mt-4 pt-2 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Signature:</h4>
            <img 
              src={getImageSrc(signature || profileData?.signature)}
              alt="Signature" 
              className="h-12 object-contain"
            />
          </div>
        )}

        {/* Payment Button - Only show for credit card */}
        {formData.paymentMethod === 'card' && (
          <div className="mt-6">
            <button className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2 text-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              Pay Invoice
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
