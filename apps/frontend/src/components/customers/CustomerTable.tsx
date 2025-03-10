import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pen, Trash2, FileText, Mail, Phone, MapPin } from "lucide-react";
import { Customer } from "@/types";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomerTable = ({ customers = [], onEdit, onDelete }: CustomerTableProps) => {
  const navigate = useNavigate();

  const handleCreateInvoice = (customer: Customer) => {
    navigate('/invoices/create', { 
      state: { 
        customer: {
          name: customer.name || '',
          address: customer.address || '',
          zip: customer.zip || '',
          city: customer.city || '',
          province: customer.state || '',
          country: customer.country || '',
          email: customer.email || '',
          phone: customer.phone || ''
        }
      }
    });
  };

  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  if (!customers.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No customers found. Add your first customer by clicking the "Add Customer" button above.
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader className="hidden sm:table-header-group">
          <TableRow className="hover:bg-transparent bg-gray-50">
            <TableHead className="font-bold text-black whitespace-nowrap">Name</TableHead>
            <TableHead className="font-bold text-black whitespace-nowrap">Contact</TableHead>
            <TableHead className="font-bold text-black whitespace-nowrap">Location</TableHead>
            <TableHead className="font-bold text-black whitespace-nowrap">Created</TableHead>
            <TableHead className="text-right font-bold text-black whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} className="group hover:bg-gray-50">
              {/* Desktop View */}
              <TableCell className="hidden sm:table-cell">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {getInitials(customer.name)}
                  </div>
                  <div>
                    <div className="font-semibold text-black">{customer.name}</div>
                    {customer.country && (
                      <Badge variant="secondary" className="mt-0.5 font-medium">
                        {customer.country}
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{customer.phone}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {(customer.city || customer.state) && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                    <MapPin className="h-3.5 w-3.5" />
                    {[customer.city, customer.state].filter(Boolean).join(", ")}
                  </div>
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="text-sm text-gray-600 font-medium">
                  {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(customer)}
                    className="h-8 w-8 text-gray-500 hover:text-primary flex items-center justify-center"
                  >
                    <Pen className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleCreateInvoice(customer)}
                    className="h-8 w-8 text-gray-500 hover:text-primary flex items-center justify-center"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDelete(customer)}
                    className="h-8 w-8 text-gray-500 hover:text-destructive flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>

              {/* Mobile View */}
              <TableCell className="sm:hidden">
                <div className="space-y-3 p-4">
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Name</div>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {getInitials(customer.name)}
                        </div>
                        <div className="font-semibold text-black">{customer.name}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Created</div>
                      <div className="text-sm text-gray-600 font-medium">
                        {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Contact</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Location</div>
                      <div>
                        {customer.country && (
                          <Badge variant="secondary" className="mb-1 font-medium">
                            {customer.country}
                          </Badge>
                        )}
                        {(customer.city || customer.state) && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                            <MapPin className="h-3.5 w-3.5" />
                            {[customer.city, customer.state].filter(Boolean).join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2 border-t">
                    <div className="grid grid-cols-3 gap-2 w-full">
                      <Button 
                        variant="ghost" 
                        onClick={() => onEdit(customer)}
                        className="h-9 text-gray-500 hover:text-primary flex items-center justify-center"
                      >
                        <Pen className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleCreateInvoice(customer)}
                        className="h-9 text-gray-500 hover:text-primary flex items-center justify-center"
                      >
                        <FileText className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Invoice</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => onDelete(customer)}
                        className="h-9 text-gray-500 hover:text-destructive flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
