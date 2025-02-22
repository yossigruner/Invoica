import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logger } from "@/utils/logger";

interface CustomerFormData {
  to: {
    name: string;
    address: string;
    zip: string;
    city: string;
    country: string;
    email: string;
    phone: string;
  };
}

interface CustomerInfoTabProps {
  formData: CustomerFormData;
  onInputChange: (section: string, field: string, value: string) => void;
}

export const CustomerInfoTab = ({ formData, onInputChange }: CustomerInfoTabProps) => {
  logger.info('Rendering CustomerInfoTab with data:', { formData });
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Bill To:</h3>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="to-name">Name:</Label>
          <Input 
            id="to-name" 
            placeholder="Receiver name" 
            value={formData.to.name}
            onChange={(e) => onInputChange("to", "name", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="to-address">Address:</Label>
          <Input 
            id="to-address" 
            placeholder="Receiver address"
            value={formData.to.address}
            onChange={(e) => onInputChange("to", "address", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="to-zip">ZIP:</Label>
            <Input 
              id="to-zip" 
              placeholder="Receiver ZIP code"
              value={formData.to.zip}
              onChange={(e) => onInputChange("to", "zip", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="to-city">City:</Label>
            <Input 
              id="to-city" 
              placeholder="Receiver city"
              value={formData.to.city}
              onChange={(e) => onInputChange("to", "city", e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="to-country">Country:</Label>
          <Input 
            id="to-country" 
            placeholder="Receiver country"
            value={formData.to.country}
            onChange={(e) => onInputChange("to", "country", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="to-email">Email:</Label>
          <Input 
            id="to-email" 
            type="email" 
            placeholder="Receiver email"
            value={formData.to.email}
            onChange={(e) => onInputChange("to", "email", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="to-phone">Phone:</Label>
          <Input 
            id="to-phone" 
            placeholder="Receiver phone number"
            value={formData.to.phone}
            onChange={(e) => onInputChange("to", "phone", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
