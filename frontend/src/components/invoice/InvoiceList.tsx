import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Download, FileDown, Mail, Trash2, Edit, FileText, ChevronLeft, ChevronRight, RefreshCw, CreditCard } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { type Invoice, type InvoiceStatus, invoicesApi } from "@/api/invoices";
import { Progress } from "@/components/ui/progress";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

type StatusColor = {
  [K in InvoiceStatus]: string;
};

const statusColors: StatusColor = {
  DRAFT: "bg-gray-100 text-gray-800",
  SENT: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-yellow-100 text-yellow-800"
};

export const InvoiceList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(false);
  const [downloadingInvoiceNumber, setDownloadingInvoiceNumber] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);

  const { 
    invoices: invoicesData, 
    isLoading, 
    error,
    deleteInvoice,
    updateInvoice
  } = useInvoices({
    page: currentPage,
    limit: pageSize,
    searchQuery: searchQuery || undefined,
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  const handleDelete = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;

    try {
      await deleteInvoice(invoiceToDelete.id);
      toast.success("Invoice deleted successfully");
      setInvoiceToDelete(null);
    } catch (error) {
      toast.error("Failed to delete invoice");
    }
  };

  const handleStatusUpdate = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowStatusDialog(true);
  };

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    if (!selectedInvoice) return;
    
    try {
      await updateInvoice({
        id: selectedInvoice.id,
        data: { status: newStatus }
      });
      toast.success("Invoice status updated successfully");
      setShowStatusDialog(false);
      setSelectedInvoice(null);
    } catch (error) {
      toast.error("Failed to update invoice status");
    }
  };

  const exportToCSV = () => {
    if (!invoicesData?.data.length) {
      toast.error("No invoices to export");
      return;
    }

    const headers = ["Invoice #", "Customer", "Date", "Amount", "Status"];
    const csvData = invoicesData.data.map((invoice: Invoice) => [
      invoice.invoiceNumber,
      invoice.billingName,
      format(new Date(invoice.issueDate), "yyyy-MM-dd"),
      `${invoice.total.toFixed(2)} ${invoice.currency}`,
      invoice.status
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map((row: string[]) => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `invoices-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}/edit`, {
      state: {
        customer: {
          id: invoice.customerId,
          name: invoice.billingName,
          email: invoice.billingEmail,
          phone: invoice.billingPhone,
          address: invoice.billingAddress,
          city: invoice.billingCity,
          zip: invoice.billingZip,
          country: invoice.billingCountry
        }
      }
    });
  };

  const handleDownloadPdf = async (invoice: Invoice) => {
    try {
      setDownloadProgress(true);
      setDownloadingInvoiceNumber(invoice.invoiceNumber);
      
      const blob = await invoicesApi.downloadPdf(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber || 'download'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      toast.error("Failed to download invoice");
    } finally {
      setDownloadProgress(false);
      setDownloadingInvoiceNumber(null);
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      setSendingInvoiceId(invoice.id);
      await invoicesApi.sendInvoice(invoice.id);
      toast.success("Invoice sent successfully!");
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error("Failed to send invoice. Please try again.");
    } finally {
      setSendingInvoiceId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-gray-600 animate-pulse">Loading invoices...</p>
        </div>
      </div>
    );
  }

  const totalInvoices = invoicesData?.meta.total || 0;
  const currentPageNumber = invoicesData?.meta.page || 1;
  const currentLimit = invoicesData?.meta.limit || pageSize;
  const totalPages = invoicesData?.meta.totalPages || 0;

  return (
    <div className="">
      <Card className="bg-white shadow-xl border rounded-xl overflow-hidden">
        <CardHeader className="border-b bg-white p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black">Invoices</h1>
                <p className="text-sm font-medium text-gray-600">
                  {totalInvoices} total invoices
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                variant="outline"
                onClick={exportToCSV}
                size="sm"
                className="h-9 sm:h-10 px-2 sm:px-3 flex items-center justify-center flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Link to="/invoices/create" className="flex-1 sm:flex-none">
                <Button size="sm" className="h-9 sm:h-10 px-2 sm:px-3 flex items-center justify-center w-full">
                  <FileText className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Create Invoice</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 h-9 sm:h-10"
              />
            </div>

            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 font-medium">
                <SelectValue placeholder="10 per page" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-auto justify-start text-left font-medium h-9 sm:h-10",
                    !dateRange?.from && "text-gray-500"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange?.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Filter by date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="">
            <Table className="">
              <TableHeader className="hidden sm:table-header-group">
                <TableRow className="hover:bg-transparent bg-gray-50">
                  <TableHead className="font-bold text-black whitespace-nowrap">Invoice #</TableHead>
                  <TableHead className="font-bold text-black whitespace-nowrap">Customer</TableHead>
                  <TableHead className="font-bold text-black whitespace-nowrap">Date</TableHead>
                  <TableHead className="font-bold text-black whitespace-nowrap">Amount</TableHead>
                  <TableHead className="font-bold text-black whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-right font-bold text-black whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesData?.data && invoicesData.data.length > 0 ? (
                  invoicesData.data.map((invoice: Invoice) => (
                    <TableRow key={invoice.id} className="group hover:bg-gray-50">
                      {/* Desktop View */}
                      <TableCell className="hidden sm:table-cell font-semibold text-black whitespace-nowrap">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell font-medium text-gray-900 whitespace-nowrap">
                        {invoice.billingName}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-gray-600 font-medium whitespace-nowrap">
                        {format(new Date(invoice.issueDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell font-semibold text-black whitespace-nowrap">
                        {invoice.total.toFixed(2)} {invoice.currency}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell whitespace-nowrap">
                        <Badge 
                          variant="secondary"
                          className={cn(statusColors[invoice.status as keyof StatusColor], "font-medium")}
                        >
                          {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditInvoice(invoice)}
                            className="h-8 w-8 text-gray-500 hover:text-primary flex items-center justify-center"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleStatusUpdate(invoice)}
                            className="h-8 w-8 text-gray-500 hover:text-primary flex items-center justify-center"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDownloadPdf(invoice)}
                            className="h-8 w-8 text-gray-500 hover:text-primary flex items-center justify-center"
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleSendInvoice(invoice)}
                            disabled={sendingInvoiceId === invoice.id}
                            className="h-8 w-8 text-gray-500 hover:text-primary flex items-center justify-center"
                          >
                            {sendingInvoiceId === invoice.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                              <Mail className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(invoice)}
                            className="h-8 w-8 text-gray-500 hover:text-destructive flex items-center justify-center"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {invoice.status !== 'PAID' && (
                            <Button 
                              variant="default"
                              size="icon"
                              onClick={() => window.open(`/pay/${invoice.id}`, '_blank')}
                              className="h-8 w-8 bg-primary hover:bg-primary/90 flex items-center justify-center"
                            >
                              <CreditCard className="h-4 w-4 text-white" />
                            </Button>
                          )}
                        </div>
                      </TableCell>

                      {/* Mobile View */}
                      <TableCell className="sm:hidden">
                        <div className="space-y-3 p-4">
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-1">Invoice #</div>
                              <div className="font-semibold text-black">{invoice.invoiceNumber}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-1">Customer</div>
                              <div className="font-medium text-gray-900">{invoice.billingName}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-1">Date</div>
                              <div className="text-gray-600 font-medium">
                                {format(new Date(invoice.issueDate), "MMM d, yyyy")}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-1">Amount</div>
                              <div className="font-semibold text-black">
                                {invoice.total.toFixed(2)} {invoice.currency}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                            <Badge 
                              variant="secondary"
                              className={cn(statusColors[invoice.status as keyof StatusColor], "font-medium")}
                            >
                              {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-start gap-2 pt-2 border-t">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditInvoice(invoice)}
                              className="h-8 w-8 text-gray-500 hover:text-primary flex items-center justify-center"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleStatusUpdate(invoice)}
                              className="h-8 w-8 text-gray-500 hover:text-primary flex items-center justify-center"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDownloadPdf(invoice)}
                              className="h-8 w-8 text-gray-500 hover:text-primary flex items-center justify-center"
                            >
                              <FileDown className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleSendInvoice(invoice)}
                              disabled={sendingInvoiceId === invoice.id}
                              className="h-8 w-8 text-gray-500 hover:text-primary flex items-center justify-center"
                            >
                              {sendingInvoiceId === invoice.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              ) : (
                                <Mail className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(invoice)}
                              className="h-8 w-8 text-gray-500 hover:text-destructive flex items-center justify-center"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {invoice.status !== 'PAID' && (
                              <Button 
                                variant="default"
                                size="icon"
                                onClick={() => window.open(`/pay/${invoice.id}`, '_blank')}
                                className="h-8 w-8 bg-primary hover:bg-primary/90 flex items-center justify-center"
                              >
                                <CreditCard className="h-4 w-4 text-white" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No invoices found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-white">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              Showing {((currentPage - 1) * pageSize) + 1} to{' '}
              {Math.min(currentPage * pageSize, totalInvoices)}{' '}
              of {totalInvoices} invoices
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 font-medium px-2 sm:px-3 flex items-center justify-center flex-1 sm:flex-none"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="flex items-center text-sm font-medium text-gray-600 px-4 bg-white rounded-md border h-9">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 font-medium px-2 sm:px-3 flex items-center justify-center flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-black">
              Update Invoice Status
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Select a new status for invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select
              defaultValue={selectedInvoice?.status}
              onValueChange={(value) => handleStatusChange(value as InvoiceStatus)}
            >
              <SelectTrigger className="w-full h-10 font-medium">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)} className="font-medium">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-black">Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete invoice {invoiceToDelete?.invoiceNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-medium">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 font-medium"
            >
              Delete Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Download Progress Dialog */}
      <Dialog open={downloadProgress} onOpenChange={(open) => !open && setDownloadProgress(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-black">
              Downloading Invoice
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Generating PDF for invoice #{downloadingInvoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#8B5CF6] border-t-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8B5CF6]/30 border-t-transparent animate-[spin_0.8s_linear_infinite]" />
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">Please wait while we prepare your download...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 