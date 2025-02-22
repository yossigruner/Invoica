import { Card } from "@/components/ui/card";
import { CustomerList } from "@/components/customers/CustomerList";
import { useState } from "react";
import { CustomersHeader } from "@/components/customers/CustomersHeader";
import { Customer, defaultCustomer } from "@/types/customer";
import { useCustomers } from "@/hooks/useCustomers";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";

const Customers = () => {
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState(defaultCustomer);
  const { createCustomer, updateCustomer, fetchCustomers, loading } = useCustomers();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <Loading message="Loading customers..." />
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof typeof defaultCustomer, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setFormData(defaultCustomer);
      setEditingCustomer(null);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      province: customer.province || '',
      zip: customer.zip || '',
      country: customer.country || ''
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
        toast.success(`${formData.name} has been updated successfully.`);
      } else {
        await createCustomer(formData);
        toast.success(`${formData.name} has been added successfully.`);
      }
      
      setOpen(false);
      setFormData(defaultCustomer);
      setEditingCustomer(null);
      await fetchCustomers();
    } catch (error) {
      toast.error('Failed to save customer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Card className="p-4 md:p-8 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="space-y-6">
            <CustomersHeader
              open={open}
              onOpenChange={handleOpenChange}
              editingCustomer={editingCustomer}
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />
            <CustomerList onEdit={handleEdit} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Customers;
