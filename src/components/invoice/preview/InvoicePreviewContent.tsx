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
    <div className="space-y-4">
      <InvoiceBillingInfo billingInfo={to} />

      <div className="w-full avoid-break">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="pb-2">ITEM</th>
              <th className="pb-2">QTY</th>
              <th className="pb-2">RATE</th>
              <th className="pb-2 text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="py-2">
                  {item.name || ''}
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  )}
                </td>
                <td className="py-2">{item.quantity || ''}</td>
                <td className="py-2">{item.rate || ''} {currency}</td>
                <td className="py-2 text-right">
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