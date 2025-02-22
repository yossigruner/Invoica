import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceAdjustments } from "../InvoiceAdjustments";

interface Adjustment {
  value: number;
  type: 'amount' | 'percentage';
}

interface SummaryTabProps {
  formData: {
    additionalNotes: string;
    currency: string;
    adjustments: {
      discount: Adjustment;
      tax: Adjustment;
      shipping: Adjustment;
    };
  };
  showDiscount: boolean;
  showTax: boolean;
  showShipping: boolean;
  onInputChange: (section: string, field: string, value: string) => void;
  onShowDiscountChange: (show: boolean) => void;
  onShowTaxChange: (show: boolean) => void;
  onShowShippingChange: (show: boolean) => void;
  onAdjustmentChange: (
    type: 'discount' | 'tax' | 'shipping',
    field: 'value' | 'type',
    value: number | 'amount' | 'percentage'
  ) => void;
  calculateTotal: () => {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

export const SummaryTab = ({
  formData,
  showDiscount,
  showTax,
  showShipping,
  onInputChange,
  onShowDiscountChange,
  onShowTaxChange,
  onShowShippingChange,
  onAdjustmentChange,
  calculateTotal
}: SummaryTabProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Additional Notes</Label>
          <Textarea
            id="additionalNotes"
            value={formData.additionalNotes}
            onChange={(e) => onInputChange("", "additionalNotes", e.target.value)}
            placeholder="Add any additional notes or terms..."
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <InvoiceAdjustments
          currency={formData.currency}
          showDiscount={showDiscount}
          showTax={showTax}
          showShipping={showShipping}
          adjustments={formData.adjustments}
          onShowDiscountChange={onShowDiscountChange}
          onShowTaxChange={onShowTaxChange}
          onShowShippingChange={onShowShippingChange}
          onAdjustmentChange={onAdjustmentChange}
          calculateTotal={calculateTotal}
        />
      </div>
    </div>
  );
}; 