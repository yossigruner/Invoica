import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Customer, defaultCustomer } from "@/types/customer";

interface CustomerFormProps {
  formData: typeof defaultCustomer;
  editingCustomer: Customer | null;
  onInputChange: (field: keyof typeof defaultCustomer, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CustomerForm = ({
  formData,
  editingCustomer,
  onInputChange,
  onSubmit
}: CustomerFormProps) => {
  return (
    <form onSubmit={onSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name" 
          value={formData.name || ''}
          onChange={(e) => { onInputChange("name", e.target.value); }}
          placeholder="Customer name" 
          className="bg-white/50 focus:bg-white transition-colors"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email"
          value={formData.email || ''}
          onChange={(e) => { onInputChange("email", e.target.value); }}
          placeholder="customer@example.com" 
          className="bg-white/50 focus:bg-white transition-colors"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input 
          id="phone"
          value={formData.phone || ''}
          onChange={(e) => { onInputChange("phone", e.target.value); }}
          placeholder="Phone number" 
          className="bg-white/50 focus:bg-white transition-colors"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        <Input 
          id="address"
          value={formData.address || ''}
          onChange={(e) => { onInputChange("address", e.target.value); }}
          placeholder="Street address" 
          className="bg-white/50 focus:bg-white transition-colors"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input 
            id="city"
            value={formData.city || ''}
            onChange={(e) => { onInputChange("city", e.target.value); }}
            placeholder="City" 
            className="bg-white/50 focus:bg-white transition-colors"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="province">Province/State</Label>
          <Input 
            id="province"
            value={formData.province || ''}
            onChange={(e) => { onInputChange("province", e.target.value); }}
            placeholder="Province/State" 
            className="bg-white/50 focus:bg-white transition-colors"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="zip">ZIP Code</Label>
          <Input 
            id="zip"
            value={formData.zip || ''}
            onChange={(e) => { onInputChange("zip", e.target.value); }}
            placeholder="ZIP code" 
            className="bg-white/50 focus:bg-white transition-colors"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="country">Country</Label>
          <Input 
            id="country"
            value={formData.country || ''}
            onChange={(e) => { onInputChange("country", e.target.value); }}
            placeholder="Country" 
            className="bg-white/50 focus:bg-white transition-colors"
          />
        </div>
      </div>
      <Button type="submit" className="mt-4">
        {editingCustomer ? "Update Customer" : "Add Customer"}
      </Button>
    </form>
  );
};
