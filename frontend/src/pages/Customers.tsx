import { useState } from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Customer, type CreateCustomerDto } from "@/api/customers";
import { 
  UserPlus, 
  Search, 
  Pencil, 
  Trash2, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  FileText,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export default function Customers() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [formData, setFormData] = useState<CreateCustomerDto>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const {
    customers,
    isLoading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCustomers();

  const navigate = useNavigate();

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomer(formData);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    });
    setIsCreateOpen(false);
  };

  const handleEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerToEdit) return;
    
    updateCustomer({
      id: customerToEdit.id,
      data: formData,
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    });
    setCustomerToEdit(null);
    setIsEditOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openEditDialog = (customer: Customer) => {
    setCustomerToEdit(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zip: customer.zip || '',
      country: customer.country || '',
    });
    setIsEditOpen(true);
  };

  const handleDeleteCustomer = () => {
    if (!customerToDelete) return;
    deleteCustomer(customerToDelete.id);
    setCustomerToDelete(null);
  };

  const filteredCustomers = customers?.filter(customer => {
    const searchLower = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower) ||
      customer.address?.toLowerCase().includes(searchLower)
    );
  });

  const totalCustomers = filteredCustomers?.length || 0;
  const totalPages = Math.ceil(totalCustomers / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCustomers = filteredCustomers?.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loading message="Loading customers..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4 text-destructive">
          <div className="p-4 rounded-full bg-destructive/10">
            <X className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium">Error loading customers</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card className="bg-white shadow-xl border rounded-xl overflow-hidden">
        <CardHeader className="border-b bg-white p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-black">Customers</h1>
                <p className="text-sm font-medium text-gray-600">
                  {totalCustomers} total customers
                </p>
              </div>
            </div>
            <Button onClick={() => setIsCreateOpen(true)} size="sm" className="h-10 font-medium">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-[180px] h-10 font-medium">
                <SelectValue placeholder="10 per page" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-gray-50">
                <TableHead className="font-bold text-black">Name</TableHead>
                <TableHead className="font-bold text-black">Contact</TableHead>
                <TableHead className="font-bold text-black">Location</TableHead>
                <TableHead className="font-bold text-black">Created</TableHead>
                <TableHead className="text-right font-bold text-black">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCustomers?.map((customer) => (
                <TableRow key={customer.id} className="group hover:bg-gray-50">
                  <TableCell>
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
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                        <Mail className="h-3.5 w-3.5 text-gray-500" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                          <Phone className="h-3.5 w-3.5" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(customer.city || customer.state) && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                        <MapPin className="h-3.5 w-3.5" />
                        {[customer.city, customer.state].filter(Boolean).join(", ")}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 font-medium">
                      {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEditDialog(customer)}
                        className="h-8 w-8 text-gray-500 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => navigate(`/create-invoice`, {
                          state: {
                            customer: {
                              name: customer.name,
                              email: customer.email,
                              phone: customer.phone,
                              address: customer.address,
                              city: customer.city,
                              state: customer.state,
                              zip: customer.zip,
                              country: customer.country
                            }
                          }
                        })}
                        className="h-8 w-8 text-gray-500 hover:text-primary"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setCustomerToDelete(customer)}
                        className="h-8 w-8 text-gray-500 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t bg-white">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, totalCustomers)} of {totalCustomers} customers
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 font-medium"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="flex items-center text-sm font-medium text-gray-600 px-4 bg-white rounded-md border h-9">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-9 font-medium"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-black">Add New Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCustomer} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name" className="font-medium text-gray-900">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="h-10"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="email" className="font-medium text-gray-900">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-10"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Province/State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP/Postal Code</Label>
                <Input
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Customer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-black">Edit Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCustomer} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-name" className="font-medium text-gray-900">Full Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="h-10"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-email" className="font-medium text-gray-900">Email Address</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-10"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-phone" className="font-medium text-gray-900">Phone Number</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-address" className="font-medium text-gray-900">Street Address</Label>
                <Input
                  id="edit-address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city" className="font-medium text-gray-900">City</Label>
                <Input
                  id="edit-city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-state" className="font-medium text-gray-900">Province/State</Label>
                <Input
                  id="edit-state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-zip" className="font-medium text-gray-900">ZIP/Postal Code</Label>
                <Input
                  id="edit-zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-country" className="font-medium text-gray-900">Country</Label>
                <Input
                  id="edit-country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Customer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-black">Delete Customer</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete {customerToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-medium">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCustomer}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 font-medium"
            >
              {isDeleting ? "Deleting..." : "Delete Customer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
