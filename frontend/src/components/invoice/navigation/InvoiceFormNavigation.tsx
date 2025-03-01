import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TabType } from "../tabs/InvoiceFormTabs";
import { InvoiceFormData } from "../types/invoice";

interface InvoiceFormNavigationProps {
  currentTab: TabType;
  onNext: () => void;
  onBack: () => void;
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

export const InvoiceFormNavigation = ({
  currentTab,
  onNext,
  onBack,
  formData,
  showDiscount,
  showTax,
  showShipping,
  paymentMethod,
  isEditing,
  initialData,
  calculateTotal,
}: InvoiceFormNavigationProps) => {
  const isFirstTab = currentTab === "from";
  const isLastTab = currentTab === "summary";

  return (
    <div className="flex justify-between pt-6 mt-6 border-t">
      <Button 
        variant="outline" 
        className="flex items-center gap-2 hover:bg-primary hover:text-white transition-colors"
        onClick={onBack}
        disabled={isFirstTab}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      {isLastTab ? (
        <Button 
          className="flex items-center gap-2"
          onClick={onNext}
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button 
          className="flex items-center gap-2"
          onClick={onNext}
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
