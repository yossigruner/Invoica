import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Customer, defaultCustomer } from "@/types/customer";
import { CustomerForm } from "./CustomerForm";

interface CustomersHeaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCustomer: Customer | null;
  formData: typeof defaultCustomer;
  onInputChange: (field: keyof typeof defaultCustomer, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CustomersHeader = ({
  open,
  onOpenChange,
  editingCustomer,
  formData,
  onInputChange,
  onSubmit
}: CustomersHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Customers</h2>
      </div>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          <CustomerForm
            formData={formData}
            editingCustomer={editingCustomer}
            onInputChange={onInputChange}
            onSubmit={onSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
