import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvoiceFormData } from "../types/invoice";

interface PaymentTabProps {
  formData: {
    paymentTerms: string;
  };
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  onInputChange: (section: keyof InvoiceFormData | "", field: string, value: string | number) => void;
}

export const PaymentTab = ({
  formData,
  paymentMethod,
  setPaymentMethod,
  onInputChange
}: PaymentTabProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Payment Information:</h3>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>Payment Method:</Label>
          <Select 
            value={paymentMethod}
            onValueChange={(value) => {
              setPaymentMethod(value);
              onInputChange("", "paymentMethod", value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank">Bank Transfer</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Credit Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="payment-terms">Payment Terms:</Label>
          <Textarea 
            id="payment-terms" 
            placeholder="Payment terms and conditions"
            value={formData.paymentTerms}
            onChange={(e) => { onInputChange("", "paymentTerms", e.target.value); }}
          />
        </div>
      </div>
    </div>
  );
};
