import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { InvoiceFormItem } from "./types/invoice";
import { logger } from "@/utils/logger";
import { useEffect } from "react";

interface InvoiceItemFormProps {
  item: InvoiceFormItem;
  index: number;
  currency: string;
  onItemChange: (index: number, field: string, value: string | number) => void;
  onRemoveItem: (index: number) => void;
  onMoveItem?: (fromIndex: number, toIndex: number) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const InvoiceItemForm = ({ 
  item, 
  index, 
  currency, 
  onItemChange, 
  onRemoveItem,
  onMoveItem,
  isFirst,
  isLast
}: InvoiceItemFormProps) => {
  // Log item data when it changes
  useEffect(() => {
    logger.info('InvoiceItemForm rendering item:', {
      index,
      item,
      isFirst,
      isLast
    });
  }, [item, index, isFirst, isLast]);

  const handleMoveUp = () => {
    if (onMoveItem && !isFirst) {
      onMoveItem(index, index - 1);
    }
  };

  const handleMoveDown = () => {
    if (onMoveItem && !isLast) {
      onMoveItem(index, index + 1);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    logger.info('Item field change:', { index, field, value });
    onItemChange(index, field, value);
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 relative border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h4 className="font-medium">#{index + 1} - {item.name || 'Empty name'}</h4>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-8 w-8 hover:bg-primary hover:text-white transition-colors"
            onClick={handleMoveUp}
            disabled={isFirst}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-8 w-8 hover:bg-primary hover:text-white transition-colors"
            onClick={handleMoveDown}
            disabled={isLast}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="icon"
            className="h-8 w-8"
            onClick={() => { onRemoveItem(index); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor={`item-name-${index}`}>Name:</Label>
            <Input 
              id={`item-name-${index}`} 
              placeholder="Item name" 
              className="mt-1 bg-white/50 focus:bg-white transition-colors"
              value={item.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`item-quantity-${index}`}>Quantity:</Label>
            <Input 
              id={`item-quantity-${index}`} 
              type="number" 
              min="0"
              placeholder="0" 
              className="mt-1 bg-white/50 focus:bg-white transition-colors"
              value={item.quantity}
              onChange={(e) => handleChange("quantity", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`item-rate-${index}`}>Rate: ({currency})</Label>
            <Input 
              id={`item-rate-${index}`} 
              type="number"
              min="0"
              step="0.01"
              placeholder="0" 
              className="mt-1 bg-white/50 focus:bg-white transition-colors h-10"
              value={item.rate}
              onChange={(e) => handleChange("rate", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Total</Label>
            <div className="mt-1 h-10 flex items-center justify-end bg-gray-50/50 px-3 rounded-md">
              <span className="font-medium">
                {((Number(item.quantity) || 0) * (Number(item.rate) || 0)).toFixed(2)} {currency}
              </span>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor={`item-description-${index}`}>Description:</Label>
          <Textarea 
            id={`item-description-${index}`} 
            placeholder="Item description" 
            className="mt-1 bg-white/50 focus:bg-white transition-colors"
            value={item.description || ''}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
