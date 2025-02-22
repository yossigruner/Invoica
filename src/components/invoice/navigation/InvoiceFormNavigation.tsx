import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { TabType } from "../tabs/InvoiceFormTabs";
import { useInvoices } from "@/hooks/useInvoices";
import { InvoiceFormData } from "../types/invoice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface InvoiceFormNavigationProps {
  currentTab: TabType;
  onNext: () => void;
  onBack: () => void;
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

export const InvoiceFormNavigation = ({
  currentTab,
  onNext,
  onBack,
  formData,
  showDiscount,
  showTax,
  showShipping,
  paymentMethod,
  calculateTotal,
}: InvoiceFormNavigationProps) => {
  const isFirstTab = currentTab === "from";
  const isLastTab = currentTab === "summary";
  const { createInvoice, loading } = useInvoices();
  const navigate = useNavigate();

  const handleSaveInvoice = async () => {
    try {
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
      navigate("/invoices");
    } catch (error) {
      toast.error("Failed to save invoice. Please try again.");
    }
  };

  return (
    <div className="flex justify-between pt-6 mt-6 border-t">
      <Button 
        variant="outline" 
        className="flex items-center gap-2 hover:bg-primary hover:text-white transition-colors"
        onClick={onBack}
        disabled={isFirstTab || loading}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      {isLastTab ? (
        <Button 
          className="flex items-center gap-2"
          onClick={handleSaveInvoice}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Invoice"}
          <Save className="h-4 w-4" />
        </Button>
      ) : (
        <Button 
          className="flex items-center gap-2"
          onClick={onNext}
          disabled={loading}
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
