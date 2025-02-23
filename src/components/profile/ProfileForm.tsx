import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProfileData } from "@/components/invoice/types/invoice";

interface ProfileFormProps {
  formData: ProfileData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileForm = ({ formData, onInputChange }: ProfileFormProps) => {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="name">Name:</Label>
        <Input 
          id="name" 
          placeholder="Your name" 
          value={formData.name}
          onChange={onInputChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address">Address:</Label>
        <Input 
          id="address" 
          placeholder="Your address" 
          value={formData.address}
          onChange={onInputChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="zip">ZIP:</Label>
          <Input 
            id="zip" 
            placeholder="Your ZIP code" 
            value={formData.zip}
            onChange={onInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="city">City:</Label>
          <Input 
            id="city" 
            placeholder="Your city" 
            value={formData.city}
            onChange={onInputChange}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="country">Country:</Label>
        <Input 
          id="country" 
          placeholder="Your country" 
          value={formData.country}
          onChange={onInputChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email:</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="Your email" 
          value={formData.email}
          onChange={onInputChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">Phone:</Label>
        <Input 
          id="phone" 
          placeholder="Your phone number" 
          value={formData.phone}
          onChange={onInputChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bankName">Bank Name:</Label>
        <Input 
          id="bankName" 
          placeholder="Your bank name" 
          value={formData.bankName || ''}
          onChange={onInputChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="accountName">Account Name:</Label>
        <Input 
          id="accountName" 
          placeholder="Your account name" 
          value={formData.accountName || ''}
          onChange={onInputChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="accountNumber">Account Number:</Label>
        <Input 
          id="accountNumber" 
          placeholder="Your account number" 
          value={formData.accountNumber || ''}
          onChange={onInputChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="swiftCode">Swift Code:</Label>
        <Input 
          id="swiftCode" 
          placeholder="Your SWIFT/BIC code" 
          value={formData.swiftCode || ''}
          onChange={onInputChange}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="iban">IBAN:</Label>
        <Input 
          id="iban" 
          placeholder="Your IBAN" 
          value={formData.iban || ''}
          onChange={onInputChange}
        />
      </div>
    </>
  );
};
