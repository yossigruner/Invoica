import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvoiceFormData } from "../types/invoice";
import { logger } from "@/utils/logger";

interface PaymentTabProps {
  formData: {
    paymentTerms: string;
    paymentMethod: string;
  };
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  onInputChange: (section: "" | keyof InvoiceFormData, field: string, value: string | number) => void;
}

export const PaymentTab = ({
  formData,
  paymentMethod,
  setPaymentMethod,
  onInputChange
}: PaymentTabProps) => {
  // Log current payment method values
  logger.info('Payment Tab rendered with:', { 
    formDataPaymentMethod: formData.paymentMethod,
    paymentMethodProp: paymentMethod 
  });

  const handlePaymentMethodChange = (value: string) => {
    logger.info('Payment method changing:', { 
      from: formData.paymentMethod, 
      to: value,
      currentPaymentMethod: paymentMethod 
    });
    setPaymentMethod(value);
    onInputChange("", "paymentMethod", value);
  };

  const handlePaymentTermsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    logger.info('Payment terms changing:', { value: e.target.value });
    onInputChange("", "paymentTerms", e.target.value);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Payment Information:</h3>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>Payment Method:</Label>
          <Select 
            value={formData.paymentMethod}
            onValueChange={handlePaymentMethodChange}
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
            onChange={handlePaymentTermsChange}
          />
        </div>
      </div>
    </div>
  );
};
