import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { useParams } from "react-router-dom";
import { useInvoice } from "@/hooks/useInvoices";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/hooks/useAuth";
import { FileText } from "lucide-react";

const CreateInvoice = () => {
  const { id } = useParams();
  const { invoice, isLoading: invoiceLoading, error: invoiceError } = useInvoice(id || "");
  const { user, loading: authLoading } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (invoice && isInitialLoad) {
      logger.info('Invoice data loaded successfully', { invoice });
      setIsInitialLoad(false);
    }
  }, [invoice, isInitialLoad]);

  if (authLoading || invoiceLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading message={authLoading ? "Loading user data..." : "Loading invoice..."} />
        </div>
      </div>
    );
  }

  if (invoiceError) {
    logger.error('Failed to load invoice', invoiceError);
    toast.error("Failed to load invoice");
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">Failed to load invoice</h3>
          <p className="text-sm text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <InvoiceForm 
        initialData={invoice || null} 
        isEditing={!!id} 
      />
    </div>
  );
};

export default CreateInvoice;
