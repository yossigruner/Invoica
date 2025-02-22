import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InvoiceItemForm } from "../InvoiceItemForm";

interface InvoiceItem {
  name: string;
  quantity: number;
  rate: number;
  description: string;
}

interface ItemsTabProps {
  formData: {
    items: InvoiceItem[];
    currency: string;
  };
  onItemChange: (index: number, field: string, value: string | number) => void;
  onRemoveItem: (index: number) => void;
  onMoveItem?: (fromIndex: number, toIndex: number) => void;
  onAddItem: () => void;
}

export const ItemsTab = ({
  formData,
  onItemChange,
  onRemoveItem,
  onMoveItem,
  onAddItem
}: ItemsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {formData.items.map((item, index) => (
          <InvoiceItemForm
            key={index}
            item={item}
            index={index}
            currency={formData.currency}
            onItemChange={onItemChange}
            onRemoveItem={onRemoveItem}
            onMoveItem={onMoveItem}
            isFirst={index === 0}
            isLast={index === formData.items.length - 1}
          />
        ))}
      </div>

      <Button type="button" variant="outline" onClick={onAddItem}>
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </Button>
    </div>
  );
}; 