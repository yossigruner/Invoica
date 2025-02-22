import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { useParams } from "react-router-dom";
import { useInvoices } from "@/hooks/useInvoices";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { Loading } from "@/components/ui/loading";

const CreateInvoice = () => {
  const { id } = useParams();
  const { fetchInvoice } = useInvoices();
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    const loadInvoice = async () => {
      if (id) {
        logger.info('Loading invoice data', { invoiceId: id });
        setLoading(true);
        try {
          const data = await fetchInvoice(id);
          logger.info('Invoice data loaded successfully', { data });
          setInvoiceData(data);
        } catch (error) {
          logger.error('Failed to load invoice', error);
          toast.error("Failed to load invoice");
        } finally {
          setLoading(false);
        }
      }
    };

    loadInvoice();
  }, [id, fetchInvoice]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <div className="container mx-auto px-4 py-6">
          <Loading message="Loading invoice..." />
        </div>
      </div>
    );
  }

  logger.info('Rendering invoice form', { isEditing: !!id, invoiceData });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 py-6">
        <InvoiceForm initialData={invoiceData} isEditing={!!id} />
      </div>
    </div>
  );
};

export default CreateInvoice;
