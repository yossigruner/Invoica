import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pen, Trash2, FileText } from "lucide-react";
import { Customer } from "@/types/customer";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { logger } from "@/utils/logger";
import { useEffect } from "react";

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomerTable = ({ customers = [], onEdit, onDelete }: CustomerTableProps) => {
  const navigate = useNavigate();

  // Log when customers prop changes
  useEffect(() => {
    logger.info('CustomerTable received customers:', {
      count: customers.length,
      customersData: customers
    });
  }, [customers]);

  const handleCreateInvoice = (customer: Customer) => {
    logger.info('Creating invoice for customer:', { customer });
    navigate('/create-invoice', { 
      state: { 
        customer: {
          name: customer.name || '',
          address: customer.address || '',
          zip: customer.zip || '',
          city: customer.city || '',
          province: customer.province || '',
          country: customer.country || '',
          email: customer.email || '',
          phone: customer.phone || ''
        }
      }
    });
  };

  // Mobile card view component
  const MobileCustomerCard = ({ customer }: { customer: Customer }) => (
    <Card className="p-4 mb-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{customer.name || 'Unnamed Customer'}</h3>
          <p className="text-sm text-gray-500">{customer.email || 'No email'}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => handleCreateInvoice(customer)}
            title="Create Invoice"
            className="h-8 w-8"
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onEdit(customer)}
            title="Edit Customer"
            className="h-8 w-8"
          >
            <Pen className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onDelete(customer)}
            title="Delete Customer"
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Phone</p>
          <p>{customer.phone || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Location</p>
          <p>{[customer.city, customer.country].filter(Boolean).join(', ') || 'N/A'}</p>
        </div>
      </div>
    </Card>
  );

  if (!Array.isArray(customers)) {
    logger.error('Invalid customers prop:', { customers });
    return (
      <div className="text-center py-8 text-red-500">
        Error: Invalid customer data
      </div>
    );
  }

  return (
    <div>
      {/* Mobile View */}
      <div className="md:hidden">
        {customers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No customers found. Add your first customer by clicking the "Add Customer" button above.
          </div>
        ) : (
          <div className="space-y-4">
            {customers.map((customer) => (
              <MobileCustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Address</TableHead>
              <TableHead className="font-semibold">City</TableHead>
              <TableHead className="font-semibold">Province</TableHead>
              <TableHead className="font-semibold">ZIP</TableHead>
              <TableHead className="font-semibold">Country</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No customers found. Add your first customer by clicking the "Add Customer" button above.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name || 'Unnamed Customer'}</TableCell>
                  <TableCell>{customer.email || 'N/A'}</TableCell>
                  <TableCell>{customer.phone || 'N/A'}</TableCell>
                  <TableCell>{customer.address || 'N/A'}</TableCell>
                  <TableCell>{customer.city || 'N/A'}</TableCell>
                  <TableCell>{customer.province || 'N/A'}</TableCell>
                  <TableCell>{customer.zip || 'N/A'}</TableCell>
                  <TableCell>{customer.country || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleCreateInvoice(customer)}
                        title="Create Invoice"
                        className="hover:border-primary hover:text-primary"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => onEdit(customer)}
                        title="Edit Customer"
                        className="hover:border-primary hover:text-primary"
                      >
                        <Pen className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => onDelete(customer)}
                        title="Delete Customer"
                        className="hover:border-primary hover:text-primary"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
