interface InvoiceItem {
  name: string;
  quantity: number;
  rate: number;
  description: string;
}

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
  items: InvoiceItem[];
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

const InvoiceBillingInfo = ({ billingInfo }: { billingInfo: BillingInfo }) => (
  <div className="space-y-1 text-sm">
    <h2 className="font-medium">{billingInfo.name || ''}</h2>
    <p>{billingInfo.address || ''}</p>
    <p>{billingInfo.city || ''}, {billingInfo.zip || ''}</p>
    <p>{billingInfo.country || ''}</p>
    <p>{billingInfo.email || ''}</p>
    <p>{billingInfo.phone || ''}</p>
  </div>
);

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
          <tfoot className="avoid-break">
            <tr className="border-t">
              <td colSpan={3} className="pt-2 text-right">Subtotal:</td>
              <td className="pt-2 text-right">
                {totals.subtotal.toFixed(2)} {currency}
              </td>
            </tr>
            {totals.discount > 0 && (
              <tr>
                <td colSpan={3} className="pt-1 text-right text-red-600">Discount:</td>
                <td className="pt-1 text-right text-red-600">
                  -{totals.discount.toFixed(2)} {currency}
                </td>
              </tr>
            )}
            {totals.tax > 0 && (
              <tr>
                <td colSpan={3} className="pt-1 text-right">Tax:</td>
                <td className="pt-1 text-right">
                  +{totals.tax.toFixed(2)} {currency}
                </td>
              </tr>
            )}
            {totals.shipping > 0 && (
              <tr>
                <td colSpan={3} className="pt-1 text-right">Shipping:</td>
                <td className="pt-1 text-right">
                  +{totals.shipping.toFixed(2)} {currency}
                </td>
              </tr>
            )}
            <tr className="border-t">
              <td colSpan={3} className="pt-2 text-right font-semibold">Total:</td>
              <td className="pt-2 text-right font-semibold">
                {totals.total.toFixed(2)} {currency}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}; 