import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { useParams } from "react-router-dom";
import { useInvoices } from "@/hooks/useInvoices";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { Loading } from "@/components/ui/loading";
import type { Invoice } from "@/types";
import { useAuth } from "@/hooks/useAuth";

const CreateInvoice = () => {
  const { id } = useParams();
  const { fetchInvoice } = useInvoices();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<Invoice | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadInvoice = async () => {
      if (!id || !isInitialLoad || !user) return;

      logger.info('Loading invoice data', { invoiceId: id, userId: user.id });
      setLoading(true);
      setError(null);

      try {
        const data = await fetchInvoice(id);
        if (!mounted) return;
        
        logger.info('Invoice data loaded successfully', { data });
        setInvoiceData(data);
        setIsInitialLoad(false);
      } catch (error) {
        if (!mounted) return;
        
        const err = error as Error;
        logger.error('Failed to load invoice', err);
        setError(err);
        toast.error("Failed to load invoice");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Only try to load invoice if we have a user
    if (user) {
      loadInvoice();
    }

    return () => {
      mounted = false;
    };
  }, [id, fetchInvoice, isInitialLoad, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <div className="container mx-auto px-4 py-6">
          <Loading message="Checking authentication..." />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-red-600">
            Please log in to access this page
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <div className="container mx-auto px-4 py-6">
          <Loading message="Loading invoice..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-red-600">
            Failed to load invoice: {error.message}
          </div>
        </div>
      </div>
    );
  }

  logger.info('Rendering invoice form', { 
    isEditing: !!id, 
    invoiceData,
    userId: user.id 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 py-6">
        <InvoiceForm initialData={invoiceData} isEditing={!!id} />
      </div>
    </div>
  );
};

export default CreateInvoice;
