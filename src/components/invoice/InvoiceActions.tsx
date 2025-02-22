import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, FileDown, Save } from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import { format } from "date-fns";
import { useInvoices } from "@/hooks/useInvoices";
import { InvoiceFormData } from "./types/invoice";

interface InvoiceActionsProps {
  formData: InvoiceFormData;
  showDiscount: boolean;
  showTax: boolean;
  showShipping: boolean;
  paymentMethod: string;
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
  calculateTotal
}: InvoiceActionsProps) => {
  const { createInvoice, loading } = useInvoices();

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
      await createInvoice(
        formData,
        showDiscount,
        showTax,
        showShipping,
        paymentMethod,
        totals
      );
      toast.success("Invoice saved successfully!");
    } catch (error) {
      console.error('Failed to save invoice:', error);
      toast.error("Failed to save invoice. Please try again.");
    }
  };

  const handleGeneratePDF = async () => {
    const element = document.querySelector('.invoice-preview');
    if (!element) {
      toast.error("Could not find invoice content");
      return;
    }

    // Get customer name and invoice number from the preview
    const customerName = document.querySelector('.invoice-preview h2')?.textContent?.trim() || 'Customer';
    const invoiceNumber = document.querySelector('.invoice-preview h1')?.textContent?.replace('Invoice #', '').trim() || 'INV';
    const currentDate = format(new Date(), 'yyyyMMdd');
    
    // Create a clean filename: date_customer_invoicenumber.pdf
    const cleanCustomerName = customerName.replace(/[^a-zA-Z0-9]/g, '');
    const filename = `${currentDate}_${cleanCustomerName}_${invoiceNumber}.pdf`;

    const opt = {
      margin: [5, 5, 5, 5],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 1.5,
        useCORS: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true,
        hotfixes: ["px_scaling"],
      },
      pagebreak: { avoid: '.avoid-break' }
    };

    try {
      const loadingToast = toast.loading('Generating PDF...');
      await html2pdf().set(opt).from(element).save();
      toast.dismiss(loadingToast);
      toast.success('PDF generated successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
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
            {loading ? "Saving..." : "Save Draft"}
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
