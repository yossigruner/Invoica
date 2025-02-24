import { format } from "date-fns";
import { Calendar as CalendarIcon, RefreshCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { generateInvoiceNumber } from "../utils/invoiceUtils";
import { logger } from "@/utils/logger";
import { InvoiceFormData } from "../types/invoice";

interface DetailsTabProps {
  formData: {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    currency: string;
  };
  onInputChange: (section: keyof InvoiceFormData | "", field: string, value: string | number) => void;
  onDateChange: (field: string, date: Date | undefined) => void;
  isEditing?: boolean;
}

export const DetailsTab = ({ formData, onInputChange, onDateChange, isEditing }: DetailsTabProps) => {
  const [issueDateOpen, setIssueDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);

  const handleGenerateInvoiceNumber = () => {
    const newInvoiceNumber = generateInvoiceNumber();
    onInputChange("", "invoiceNumber", newInvoiceNumber);
  };

  const formatDate = (dateString: string) => {
    try {
      logger.debug('Formatting date', { dateString });
      return dateString ? format(new Date(dateString), "PPP") : "Pick a date";
    } catch (error) {
      logger.error('Error formatting date:', { dateString, error });
      return "Pick a date";
    }
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    logger.debug('Date change in DetailsTab', {
      field,
      date,
      isoString: date?.toISOString()
    });
    
    if (date) {
      onDateChange(field, date);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Invoice Details:</h3>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="invoice-number">
            Invoice Number:
            {isEditing && (
              <span className="ml-2 text-sm text-muted-foreground">(Cannot be changed)</span>
            )}
          </Label>
          <div className="flex gap-2">
            <Input 
              id="invoice-number" 
              placeholder="Enter or generate invoice number"
              value={formData.invoiceNumber}
              onChange={(e) => { onInputChange("", "invoiceNumber", e.target.value); }}
              className="flex-1"
              disabled={isEditing}
            />
            <Button 
              variant="outline"
              onClick={handleGenerateInvoiceNumber}
              type="button"
              className="flex gap-2 items-center hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
              disabled={isEditing}
            >
              <RefreshCcw className="h-4 w-4" />
              Generate
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="issue-date">Issue Date:</Label>
          <Popover open={issueDateOpen} onOpenChange={setIssueDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.issueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDate(formData.issueDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.issueDate ? new Date(formData.issueDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    onDateChange("issueDate", date);
                    setIssueDateOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="due-date">Due Date:</Label>
          <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDate(formData.dueDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                onSelect={(date) => {
                  logger.debug('Due date selected in calendar', { date });
                  handleDateChange("dueDate", date);
                  setDueDateOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="currency">Currency:</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => { onInputChange("", "currency", value); }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">United States Dollar (USD)</SelectItem>
              <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
              <SelectItem value="EUR">Euro (EUR)</SelectItem>
              <SelectItem value="GBP">British Pound (GBP)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
