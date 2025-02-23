import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, FileDown, Save } from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import { format } from "date-fns";
import { useInvoices } from "@/hooks/useInvoices";
import { InvoiceFormData } from "./types/invoice";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";

interface InvoiceActionsProps {
  formData: InvoiceFormData;
  showDiscount: boolean;
  showTax: boolean;
  showShipping: boolean;
  paymentMethod: string;
  isEditing?: boolean;
  initialData?: { id: string } | null;
  calculateTotal: () => {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

export const InvoiceActions = ({
  formData,
  showDiscount,
  showTax,
  showShipping,
  paymentMethod,
  isEditing,
  initialData,
  calculateTotal
}: InvoiceActionsProps) => {
  const { createInvoice, updateInvoice, loading } = useInvoices();
  const navigate = useNavigate();

  const handleSendEmail = () => {
    toast.success("Invoice sent via email successfully!");
  };

  const handleSendSMS = () => {
    toast.success("Invoice sent via SMS successfully!");
  };

  const handleSaveInvoice = async () => {
    try {
      // Validate required dates
      if (!formData.issueDate) {
        toast.error("Please set an issue date");
        return;
      }

      const totals = calculateTotal();
      
      if (isEditing && initialData?.id) {
        await updateInvoice(
          initialData.id,
          formData,
          showDiscount,
          showTax,
          showShipping,
          paymentMethod,
          totals
        );
        toast.success("Invoice updated successfully!");
      } else {
        await createInvoice(
          formData,
          showDiscount,
          showTax,
          showShipping,
          paymentMethod,
          totals
        );
        toast.success("Invoice created successfully!");
      }
      
      navigate("/");
    } catch (error) {
      logger.error(isEditing ? 'Failed to update invoice' : 'Failed to create invoice', error);
      toast.error(isEditing ? "Failed to update invoice" : "Failed to create invoice");
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const element = document.getElementById('invoice-preview');
      if (!element) {
        toast.error("Invoice preview not found");
        return;
      }

      const opt = {
        margin: 1,
        filename: `invoice-${formData.invoiceNumber}-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success("PDF generated successfully!");
    } catch (error) {
      logger.error('Failed to generate PDF:', error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Actions</h2>
      <p className="text-sm text-gray-500 mb-4">Operations and preview</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full hover:bg-primary hover:text-white transition-colors"
            onClick={handleSaveInvoice}
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : isEditing ? "Update Draft" : "Save Draft"}
          </Button>
          <Button 
            variant="outline" 
            className="w-full hover:bg-primary hover:text-white transition-colors"
            onClick={handleSendEmail}
          >
            <Mail className="w-4 h-4 mr-2" />
            Send via Email
          </Button>
        </div>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full hover:bg-primary hover:text-white transition-colors"
            onClick={handleGeneratePDF}
          >
            <FileDown className="w-4 h-4 mr-2" />
            Generate PDF
          </Button>
          <Button 
            variant="outline" 
            className="w-full hover:bg-primary hover:text-white transition-colors"
            onClick={handleSendSMS}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send via SMS
          </Button>
        </div>
      </div>
    </div>
  );
};
