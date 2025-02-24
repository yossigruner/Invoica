
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface InvoiceDetailsTabProps {
  formData: {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    currency: string;
  };
  handleInputChange: (section: string, field: string, value: string) => void;
  handleDateChange: (field: string, value: Date | undefined) => void;
}

export const InvoiceDetailsTab = ({ formData, handleInputChange, handleDateChange }: InvoiceDetailsTabProps) => {
  const generateInvoiceNumber = () => {
    const prefix = 'INV';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const newInvoiceNumber = `${prefix}-${timestamp}-${random}`;
    handleInputChange("invoiceNumber", "", newInvoiceNumber);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Invoice Details:</h3>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="invoice-number">Invoice Number:</Label>
          <div className="flex gap-2">
            <Input 
              id="invoice-number" 
              placeholder="Invoice number"
              value={formData.invoiceNumber}
              onChange={(e) => { handleInputChange("invoiceNumber", "", e.target.value); }}
              className="flex-1"
            />
            <Button 
              variant="outline"
              onClick={generateInvoiceNumber}
              type="button"
              className="flex gap-2 items-center hover:bg-primary hover:text-white transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              Generate
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="issue-date">Issue Date:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.issueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.issueDate ? format(new Date(formData.issueDate), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.issueDate ? new Date(formData.issueDate) : undefined}
                onSelect={(date) => { handleDateChange("issueDate", date); }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="due-date">Due Date:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dueDate ? format(new Date(formData.dueDate), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                onSelect={(date) => { handleDateChange("dueDate", date); }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="currency">Currency:</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => { handleInputChange("currency", "", value); }}
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
