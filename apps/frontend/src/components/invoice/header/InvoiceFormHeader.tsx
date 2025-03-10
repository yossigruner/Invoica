import { FileText } from "lucide-react";
import { TabType } from "../tabs/InvoiceFormTabs";
import { Dispatch, SetStateAction } from "react";

interface InvoiceFormHeaderProps {
  isEditing?: boolean;
  currentTab: TabType;
  setCurrentTab: Dispatch<SetStateAction<TabType>>;
}

export const InvoiceFormHeader = ({ isEditing, currentTab, setCurrentTab }: InvoiceFormHeaderProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent flex items-center gap-2">
        <FileText className="h-8 w-8 stroke-primary-600" />
        {isEditing ? 'Edit Invoice' : 'Create Invoice'}
      </h2>
      <p className="text-gray-500 mt-1">
        {isEditing ? 'Update the invoice details below' : 'Generate a new invoice for your customer'}
      </p>
    </div>
  );
};
