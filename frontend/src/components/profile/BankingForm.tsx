
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BankingFormData {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
  iban: string;
}

interface BankingFormProps {
  formData: BankingFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BankingForm = ({ formData, onInputChange }: BankingFormProps) => {
  return (
    <div className="pt-6 border-t">
      <h3 className="text-lg font-semibold mb-4">Banking Information</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="bankName">Bank Name:</Label>
            <Input 
              id="bankName" 
              placeholder="Bank Name" 
              value={formData.bankName}
              onChange={onInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="accountName">Account Name:</Label>
            <Input 
              id="accountName" 
              placeholder="Account Name" 
              value={formData.accountName}
              onChange={onInputChange}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="accountNumber">Account Number:</Label>
          <Input 
            id="accountNumber" 
            placeholder="Account Number" 
            value={formData.accountNumber}
            onChange={onInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="swiftCode">SWIFT/BIC Code:</Label>
          <Input 
            id="swiftCode" 
            placeholder="SWIFT/BIC Code" 
            value={formData.swiftCode}
            onChange={onInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="iban">IBAN:</Label>
          <Input 
            id="iban" 
            placeholder="IBAN" 
            value={formData.iban}
            onChange={onInputChange}
          />
        </div>
      </div>
    </div>
  );
};
