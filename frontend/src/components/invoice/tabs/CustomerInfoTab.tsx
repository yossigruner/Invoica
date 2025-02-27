import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logger } from "@/utils/logger";
import { InvoiceFormData } from "../types/invoice";

interface CustomerInfoTabProps {
  formData: {
    to: {
      name: string;
      address: string;
      zip: string;
      city: string;
      province: string;
      country: string;
      email: string;
      phone: string;
    };
  };
  onInputChange: (section: keyof InvoiceFormData | "", field: string, value: string | number) => void;
}

export const CustomerInfoTab = ({ formData, onInputChange }: CustomerInfoTabProps) => {
  logger.info('Rendering CustomerInfoTab with data:', { formData });
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Customer Information:</h3>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="customer-name">Name:</Label>
          <Input 
            id="customer-name" 
            placeholder="Customer name" 
            value={formData.to.name}
            onChange={(e) => { onInputChange("to", "name", e.target.value); }}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="customer-address">Address:</Label>
          <Input 
            id="customer-address" 
            placeholder="Customer address" 
            value={formData.to.address}
            onChange={(e) => { onInputChange("to", "address", e.target.value); }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="customer-zip">ZIP:</Label>
            <Input 
              id="customer-zip" 
              placeholder="ZIP code" 
              value={formData.to.zip}
              onChange={(e) => { onInputChange("to", "zip", e.target.value); }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customer-city">City:</Label>
            <Input 
              id="customer-city" 
              placeholder="City" 
              value={formData.to.city}
              onChange={(e) => { onInputChange("to", "city", e.target.value); }}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="customer-province">Province/State:</Label>
          <Input 
            id="customer-province" 
            placeholder="Province or State" 
            value={formData.to.province}
            onChange={(e) => { onInputChange("to", "province", e.target.value); }}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="customer-country">Country:</Label>
          <Input 
            id="customer-country" 
            placeholder="Country" 
            value={formData.to.country}
            onChange={(e) => { onInputChange("to", "country", e.target.value); }}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="customer-email">Email:</Label>
          <Input 
            id="customer-email" 
            type="email" 
            placeholder="Customer email" 
            value={formData.to.email}
            onChange={(e) => { onInputChange("to", "email", e.target.value); }}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="customer-phone">Phone:</Label>
          <Input 
            id="customer-phone" 
            placeholder="Customer phone" 
            value={formData.to.phone}
            onChange={(e) => { onInputChange("to", "phone", e.target.value); }}
          />
        </div>
      </div>
    </div>
  );
};
