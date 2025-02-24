import { InvoiceBillingInfo } from "./InvoiceBillingInfo";
import { InvoiceAdjustments } from "./InvoiceAdjustments";
import { InvoiceFormItem } from "../types/invoice";

interface BillingInfo {
  name: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  email: string;
  phone: string;
}

interface InvoicePreviewContentProps {
  items: InvoiceFormItem[];
  currency: string;
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  to: BillingInfo;
}

export const InvoicePreviewContent = ({
  items,
  currency,
  totals,
  to
}: InvoicePreviewContentProps) => {
  return (
    <div className="space-y-3">
      <InvoiceBillingInfo billingInfo={to} />

      <div className="w-full avoid-break">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-1">ITEM</th>
              <th className="py-1">QTY</th>
              <th className="py-1">RATE</th>
              <th className="py-1 text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-1">
                  {item.name || ''}
                  {item.description && (
                    <p className="text-xs text-gray-500">{item.description}</p>
                  )}
                </td>
                <td className="py-1">{item.quantity || ''}</td>
                <td className="py-1">{item.rate || ''} {currency}</td>
                <td className="py-1 text-right">
                  {(Number(item.quantity) * Number(item.rate)).toFixed(2)} {currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InvoiceAdjustments
        currency={currency}
        totals={totals}
      />
    </div>
  );
}; 