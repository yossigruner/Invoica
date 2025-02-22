
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface Adjustment {
  value: number;
  type: 'amount' | 'percentage';
}

interface InvoiceAdjustmentsProps {
  currency: string;
  showDiscount: boolean;
  showTax: boolean;
  showShipping: boolean;
  adjustments: {
    discount: Adjustment;
    tax: Adjustment;
    shipping: Adjustment;
  };
  onShowDiscountChange: (show: boolean) => void;
  onShowTaxChange: (show: boolean) => void;
  onShowShippingChange: (show: boolean) => void;
  onAdjustmentChange: (type: 'discount' | 'tax' | 'shipping', field: 'value' | 'type', value: number | 'amount' | 'percentage') => void;
  calculateTotal: () => {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

export const InvoiceAdjustments = ({
  currency,
  showDiscount,
  showTax,
  showShipping,
  adjustments,
  onShowDiscountChange,
  onShowTaxChange,
  onShowShippingChange,
  onAdjustmentChange,
  calculateTotal
}: InvoiceAdjustmentsProps) => {
  const totals = calculateTotal();

  return (
    <Card className="p-4 sm:p-6 bg-white/50 backdrop-blur-sm">
      <div className="flex flex-col gap-4">
        {/* Discount Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center justify-between sm:w-24">
            <Label className="cursor-pointer">Discount</Label>
            <Switch
              checked={showDiscount}
              onCheckedChange={onShowDiscountChange}
              className="sm:hidden"
            />
          </div>
          {showDiscount && (
            <div className="flex-1 flex items-center gap-2">
              <Input
                type="number"
                value={adjustments.discount.value}
                onChange={(e) => onAdjustmentChange('discount', 'value', Number(e.target.value))}
                className="w-full sm:w-32"
              />
              <Select
                value={adjustments.discount.type}
                onValueChange={(value: 'amount' | 'percentage') => 
                  onAdjustmentChange('discount', 'type', value)
                }
              >
                <SelectTrigger className="w-24 sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">{currency}</SelectItem>
                  <SelectItem value="percentage">%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Switch
            checked={showDiscount}
            onCheckedChange={onShowDiscountChange}
            className="hidden sm:block"
          />
        </div>

        {/* Tax Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center justify-between sm:w-24">
            <Label className="cursor-pointer">Tax</Label>
            <Switch
              checked={showTax}
              onCheckedChange={onShowTaxChange}
              className="sm:hidden"
            />
          </div>
          {showTax && (
            <div className="flex-1 flex items-center gap-2">
              <Input
                type="number"
                value={adjustments.tax.value}
                onChange={(e) => onAdjustmentChange('tax', 'value', Number(e.target.value))}
                className="w-full sm:w-32"
              />
              <Select
                value={adjustments.tax.type}
                onValueChange={(value: 'amount' | 'percentage') => 
                  onAdjustmentChange('tax', 'type', value)
                }
              >
                <SelectTrigger className="w-24 sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">{currency}</SelectItem>
                  <SelectItem value="percentage">%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Switch
            checked={showTax}
            onCheckedChange={onShowTaxChange}
            className="hidden sm:block"
          />
        </div>

        {/* Shipping Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center justify-between sm:w-24">
            <Label className="cursor-pointer">Shipping</Label>
            <Switch
              checked={showShipping}
              onCheckedChange={onShowShippingChange}
              className="sm:hidden"
            />
          </div>
          {showShipping && (
            <div className="flex-1 flex items-center gap-2">
              <Input
                type="number"
                value={adjustments.shipping.value}
                onChange={(e) => onAdjustmentChange('shipping', 'value', Number(e.target.value))}
                className="w-full sm:w-32"
              />
              <Select
                value={adjustments.shipping.type}
                onValueChange={(value: 'amount' | 'percentage') => 
                  onAdjustmentChange('shipping', 'type', value)
                }
              >
                <SelectTrigger className="w-24 sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">{currency}</SelectItem>
                  <SelectItem value="percentage">%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Switch
            checked={showShipping}
            onCheckedChange={onShowShippingChange}
            className="hidden sm:block"
          />
        </div>

        {/* Totals Section */}
        <div className="space-y-3 pt-6 border-t">
          <div className="flex justify-between items-center text-sm sm:text-base">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{totals.subtotal.toFixed(2)} {currency}</span>
          </div>
          {showDiscount && (
            <div className="flex justify-between items-center text-sm sm:text-base text-red-600">
              <span>Discount</span>
              <span>-{totals.discount.toFixed(2)} {currency}</span>
            </div>
          )}
          {showTax && (
            <div className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-gray-600">Tax</span>
              <span>+{totals.tax.toFixed(2)} {currency}</span>
            </div>
          )}
          {showShipping && (
            <div className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-gray-600">Shipping</span>
              <span>+{totals.shipping.toFixed(2)} {currency}</span>
            </div>
          )}
          <div className="flex justify-between items-center font-medium text-base sm:text-lg pt-2 border-t">
            <span>Total Amount</span>
            <span>{totals.total.toFixed(2)} {currency}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
