import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Download, FileDown, Mail, Trash2, Edit, FileText, ChevronLeft, ChevronRight, RefreshCw, CreditCard } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useState, useMemo, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { Loading } from "@/components/ui/loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { type Invoice, type InvoiceStatus, CreateInvoiceDto, invoicesApi } from "@/api/invoices";
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
  const { invoices, isLoading, error, deleteInvoice, updateInvoice } = useInvoices();
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

  const filteredInvoices = useMemo(() => {
    return invoices?.filter((invoice) => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.billingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.total.toString().includes(searchQuery.toLowerCase());

      if (dateRange?.from && dateRange?.to) {
        const invoiceDate = new Date(invoice.issueDate);
        return (
          matchesSearch &&
          invoiceDate >= dateRange.from &&
          invoiceDate <= dateRange.to
        );
      }

      return matchesSearch;
    }) || [];
  }, [invoices, searchQuery, dateRange]);

  const totalPages = Math.ceil((filteredInvoices?.length || 0) / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedInvoices = useMemo(() => {
    return filteredInvoices.slice(startIndex, endIndex);
  }, [filteredInvoices, startIndex, endIndex]);

  const exportToCSV = () => {
    const headers = ["Invoice #", "Customer", "Date", "Amount", "Status"];
    const csvData = filteredInvoices.map(invoice => [
      invoice.invoiceNumber,
      invoice.billingName,
      format(new Date(invoice.issueDate), "yyyy-MM-dd"),
      `${invoice.total.toFixed(2)} ${invoice.currency}`,
      invoice.status
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
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

      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setDownloadProgress(false);
      setDownloadingInvoiceNumber(null);
    }
  };

  // Add effect for progress animation
  useEffect(() => {
    if (downloadProgress) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = oldProgress + 2;
          return newProgress >= 100 ? 0 : newProgress;
        });
      }, 100);

      return () => {
        clearInterval(timer);
        setProgress(0);
      };
    }
  }, [downloadProgress]);

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

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-xl border rounded-xl overflow-hidden">
        <CardHeader className="border-b bg-white p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-black">Invoices</h1>
                <p className="text-sm font-medium text-gray-600">
                  {filteredInvoices.length} total invoices
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={exportToCSV}
                size="lg"
                className="h-10"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Link to="/invoices/create">
                <Button size="lg" className="h-10">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10 h-10"
              />
            </div>

            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-[180px] h-10 font-medium">
                <SelectValue placeholder="5 per page" />
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
                    "w-full md:w-auto justify-start text-left font-medium h-10",
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
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-gray-50">
                <TableHead className="font-bold text-black">Invoice #</TableHead>
                <TableHead className="font-bold text-black">Customer</TableHead>
                <TableHead className="font-bold text-black">Date</TableHead>
                <TableHead className="font-bold text-black">Amount</TableHead>
                <TableHead className="font-bold text-black">Status</TableHead>
                <TableHead className="text-right font-bold text-black">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="group hover:bg-gray-50">
                    <TableCell className="font-semibold text-black">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {invoice.billingName}
                    </TableCell>
                    <TableCell className="text-gray-600 font-medium">
                      {format(new Date(invoice.issueDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-semibold text-black">
                      {invoice.total.toFixed(2)} {invoice.currency}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={cn(statusColors[invoice.status], "font-medium")}
                      >
                        {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditInvoice(invoice)}
                          className="h-8 w-8 text-gray-500 hover:text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleStatusUpdate(invoice)}
                          className="h-8 w-8 text-gray-500 hover:text-primary"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDownloadPdf(invoice)}
                          className="h-8 w-8 text-gray-500 hover:text-primary"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toast.info("Send email coming soon")}
                          className="h-8 w-8 text-gray-500 hover:text-primary"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(invoice)}
                          className="h-8 w-8 text-gray-500 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {invoice.status !== 'PAID' && (
                          <Button 
                            variant="default"
                            size="icon"
                            onClick={() => window.open(`/pay/${invoice.id}`, '_blank')}
                            className="h-8 w-8 bg-primary hover:bg-primary/90"
                          >
                            <CreditCard className="h-4 w-4 text-white" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t bg-white">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredInvoices.length)} of {filteredInvoices.length} invoices
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 font-medium"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="flex items-center text-sm font-medium text-gray-600 px-4 bg-white rounded-md border h-9">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-9 font-medium"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
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
          <div className="py-6">
            <Progress value={progress} className="w-full animate-pulse" />
            <p className="text-sm text-gray-500 mt-2 text-center">Please wait while we prepare your download...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 