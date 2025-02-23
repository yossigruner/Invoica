import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Customer } from "@/types";
import { useState, useEffect } from "react";
import { CustomerSearch } from "./CustomerSearch";
import { CustomerTable } from "./CustomerTable";
import { CustomerPagination } from "./CustomerPagination";
import { useCustomers } from "@/hooks/useCustomers";
import { Loader2 } from "lucide-react";
import { logger } from "@/utils/logger";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CustomerListProps {
  onEdit: (customer: Customer) => void;
}

export const CustomerList = ({ onEdit }: CustomerListProps) => {
  const { 
    customers,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    deleteCustomer,
    loading,
    error,
    fetchCustomers
  } = useCustomers();
  
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Add effect to log customers state
  useEffect(() => {
    logger.info('CustomerList state:', {
      customersCount: customers.length,
      loading,
      error: error?.message || 'none',
      currentPage,
      pageSize,
      totalPages,
      searchQuery
    });
  }, [customers, loading, error, currentPage, pageSize, totalPages, searchQuery]);

  // Add effect to fetch customers periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCustomers();
    }, 5000); // Fetch every 5 seconds

    return () => { clearInterval(interval); };
  }, [fetchCustomers]);

  const handleDelete = async (customer: Customer) => {
    try {
      logger.info('Deleting customer', { customerId: customer.id });
      setCustomerToDelete(customer);
    } catch (error) {
      logger.error('Failed to delete customer', error);
    }
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      try {
        await deleteCustomer(customerToDelete.id);
        setCustomerToDelete(null);
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };

  if (loading) {
    return <Loading message="Loading customer list..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
        <div className="text-red-500">Failed to load customers: {error.message}</div>
        <button 
          onClick={() => fetchCustomers()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  // Debug output for empty customers
  if (!customers.length) {
    logger.warn('No customers available to display', {
      customers,
      loading,
      error
    });
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); }}
          className="pl-10"
        />
      </div>
      
      <CustomerTable 
        customers={customers}
        onEdit={onEdit}
        onDelete={handleDelete}
      />

      <CustomerPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        totalItems={customers.length || 0}
      />

      <AlertDialog open={!!customerToDelete} onOpenChange={() => { setCustomerToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-medium">{customerToDelete?.name}</span> and remove their
              data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
