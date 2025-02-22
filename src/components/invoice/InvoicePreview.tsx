
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface InvoicePreviewProps {
  formData: {
    invoiceNumber?: string;
    issueDate?: Date;
    dueDate?: Date;
    to: {
      name: string;
      address: string;
      zip: string;
      city: string;
      country: string;
      email: string;
      phone: string;
    };
    items: Array<{
      name: string;
      quantity: number;
      rate: number;
      description: string;
    }>;
    currency: string;
    paymentTerms: string;
    adjustments: {
      discount: { value: number; type: "amount" | "percentage" };
      tax: { value: number; type: "amount" | "percentage" };
      shipping: { value: number; type: "amount" | "percentage" };
    };
  };
  showDiscount?: boolean;
  showTax?: boolean;
  showShipping?: boolean;
}

export const InvoicePreview = ({ formData, showDiscount, showTax, showShipping }: InvoicePreviewProps) => {
  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateAdjustment = (value: number, type: 'amount' | 'percentage', subtotal: number) => {
    return type === 'amount' ? value : (subtotal * value) / 100;
  };

  const subtotal = calculateSubtotal();
  const discount = showDiscount ? calculateAdjustment(
    formData.adjustments.discount.value,
    formData.adjustments.discount.type,
    subtotal
  ) : 0;
  const tax = showTax ? calculateAdjustment(
    formData.adjustments.tax.value,
    formData.adjustments.tax.type,
    subtotal
  ) : 0;
  const shipping = showShipping ? calculateAdjustment(
    formData.adjustments.shipping.value,
    formData.adjustments.shipping.type,
    subtotal
  ) : 0;
  const total = subtotal - discount + tax + shipping;

  return (
    <Card className="p-8 sticky top-24 shadow-lg bg-white/80 backdrop-blur-sm border-0">
      <div className="flex justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Invoice #{formData.invoiceNumber || '_______'}</h2>
        </div>
        <div className="space-y-2 text-sm text-right">
          <div>
            <span className="text-gray-600">Issue date: </span>
            <span>{formData.issueDate ? format(formData.issueDate, 'PP') : 'Select date'}</span>
          </div>
          <div>
            <span className="text-gray-600">Due date: </span>
            <span>{formData.dueDate ? format(formData.dueDate, 'PP') : 'Select date'}</span>
          </div>
          <div>
            <span className="text-gray-600">Currency: </span>
            <span className="font-semibold">{formData.currency}</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-semibold mb-2">Bill to:</h3>
        <div className="space-y-1 text-sm">
          <p className="font-medium">{formData.to.name || 'Customer Name'}</p>
          <p>{formData.to.address || 'Customer Address'}</p>
          <p>{formData.to.city || 'City'}, {formData.to.zip || 'ZIP'}, {formData.to.country || 'Country'}</p>
          <p>{formData.to.email || 'customer@email.com'}</p>
          <p>{formData.to.phone || '+1 234 567 890'}</p>
        </div>
      </div>

      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">ITEM</th>
              <th className="text-center py-2">QTY</th>
              <th className="text-right py-2">RATE</th>
              <th className="text-right py-2">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.length > 0 ? formData.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="text-right py-2">{item.rate.toFixed(2)} {formData.currency}</td>
                <td className="text-right py-2">{(item.quantity * item.rate).toFixed(2)} {formData.currency}</td>
              </tr>
            )) : (
              <tr className="border-b">
                <td colSpan={3} className="py-4 text-center text-gray-500">
                  No items added
                </td>
                <td className="text-right py-4">0.00 {formData.currency}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 border rounded-lg p-6 bg-white text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Subtotal:</span>
          <span>{subtotal.toFixed(2)} {formData.currency}</span>
        </div>
        
        {showDiscount && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              Discount 
              <span className="text-xs ml-1">
                ({formData.adjustments.discount.type === 'percentage' ? 
                  `${formData.adjustments.discount.value}%` : 
                  `${formData.adjustments.discount.value} ${formData.currency}`})
              </span>
            </span>
            <span className="text-red-500">-{discount.toFixed(2)} {formData.currency}</span>
          </div>
        )}
        
        {showTax && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              Tax
              <span className="text-xs ml-1">
                ({formData.adjustments.tax.type === 'percentage' ? 
                  `${formData.adjustments.tax.value}%` : 
                  `${formData.adjustments.tax.value} ${formData.currency}`})
              </span>
            </span>
            <span>+{tax.toFixed(2)} {formData.currency}</span>
          </div>
        )}
        
        {showShipping && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              Shipping
              <span className="text-xs ml-1">
                ({formData.adjustments.shipping.type === 'percentage' ? 
                  `${formData.adjustments.shipping.value}%` : 
                  `${formData.adjustments.shipping.value} ${formData.currency}`})
              </span>
            </span>
            <span>+{shipping.toFixed(2)} {formData.currency}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4 border-t font-medium">
          <span>Total Amount:</span>
          <span>{total.toFixed(2)} {formData.currency}</span>
        </div>
      </div>

      {formData.paymentTerms && (
        <div className="mt-8">
          <h4 className="font-semibold mb-2">Payment terms:</h4>
          <p className="text-sm">{formData.paymentTerms}</p>
        </div>
      )}
    </Card>
  );
};
