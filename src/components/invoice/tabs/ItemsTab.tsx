import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InvoiceItemForm } from "../InvoiceItemForm";
import { InvoiceFormItem } from "../types/invoice";
import { logger } from "@/utils/logger";
import { useEffect } from "react";

interface ItemsTabProps {
  formData: {
    items: InvoiceFormItem[];
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
  // Log items when they change
  useEffect(() => {
    logger.info('ItemsTab received items:', {
      itemsCount: formData.items.length,
      items: formData.items
    });
  }, [formData.items]);

  if (!Array.isArray(formData.items)) {
    logger.error('Invalid items array:', formData.items);
    return (
      <div className="p-4 text-red-500">
        Error: Invalid items data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {formData.items.map((item, index) => (
          <InvoiceItemForm
            key={item.id || index}
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