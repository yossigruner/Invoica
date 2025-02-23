import { formatAmountInWords } from "../utils/invoiceUtils";

interface InvoiceAdjustmentsProps {
  currency: string;
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

export const InvoiceAdjustments = ({ currency, totals }: InvoiceAdjustmentsProps) => {
  return (
    <div className="w-full">
      <table className="w-full text-sm">
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
          <tr>
            <td colSpan={4} className="pt-2 text-right text-gray-600 text-sm italic">
              Amount in words: {formatAmountInWords(totals.total, currency)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}; 