import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, Mail, MessageSquare, Copy, ExternalLink, Link as LinkIcon, X, FileDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { invoicesApi } from "@/api/invoices";
import { logger } from "@/utils/logger";

interface InvoiceActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  isEditing: boolean;
  isSaving: boolean;
  invoiceId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  onDownloadPDF?: () => Promise<void>;
}

export const InvoiceActionDialog = ({
  isOpen,
  onClose,
  onSave,
  isEditing,
  isSaving,
  invoiceId,
  recipientEmail,
  recipientPhone,
  onDownloadPDF
}: InvoiceActionDialogProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const baseUrl = window.location.origin;
  const paymentLink = invoiceId ? `${baseUrl}/pay/${invoiceId}` : undefined;

  const handleCopyLink = async () => {
    if (paymentLink) {
      try {
        await navigator.clipboard.writeText(paymentLink);
        setIsCopied(true);
        toast.success("Payment link copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        toast.error("Failed to copy payment link");
      }
    }
  };

  const handleOpenPaymentLink = async () => {
    if (!invoiceId) return;

    try {
      const payment = await invoicesApi.generatePaymentLink(invoiceId);
      setPaymentStatus(payment.status);
      
      if (payment.status === 'SUCCESS') {
        toast.success("Payment processed successfully!");
        // You might want to refresh the invoice status here
      } else {
        toast.info(`Payment status: ${payment.status}`);
      }
    } catch (error) {
      logger.error('Failed to process payment:', error);
      toast.error("Failed to process payment");
    }
  };

  const handleSendEmail = async () => {
    if (!invoiceId || !recipientEmail) {
      toast.error("No recipient email address available");
      return;
    }

    try {
      setIsSendingEmail(true);
      await invoicesApi.sendEmail(invoiceId, recipientEmail);
      toast.success("Email sent successfully!");
    } catch (error) {
      logger.error('Failed to send email:', error);
      toast.error("Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendSMS = async () => {
    if (!invoiceId || !recipientPhone) {
      toast.error("No recipient phone number available");
      return;
    }

    try {
      setIsSendingSMS(true);
      await invoicesApi.sendSMS(invoiceId, recipientPhone);
      toast.success("SMS sent successfully!");
    } catch (error) {
      logger.error('Failed to send SMS:', error);
      toast.error("Failed to send SMS");
    } finally {
      setIsSendingSMS(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-none shadow-lg">
        <div className="absolute right-4 top-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-500 hover:text-gray-900"
            onClick={onClose}
          >
          </Button>
        </div>
        <div className="p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center text-gray-900">
              {isEditing ? "Update Invoice" : "Create Invoice"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {/* Update Button */}
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save className={`h-5 w-5 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
              {isSaving ? 'Updating...' : 'Update'}
            </Button>

            {/* Email Button */}
            {recipientEmail && (
              <Button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Mail className={`h-5 w-5 mr-2 ${isSendingEmail ? 'animate-spin' : ''}`} />
                {isSendingEmail ? 'Sending...' : 'Email'}
              </Button>
            )}

            {/* SMS Button */}
            {recipientPhone && (
              <Button
                onClick={handleSendSMS}
                disabled={isSendingSMS}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <MessageSquare className={`h-5 w-5 mr-2 ${isSendingSMS ? 'animate-spin' : ''}`} />
                {isSendingSMS ? 'Sending...' : 'SMS'}
              </Button>
            )}

            {/* PDF Download Button */}
            {onDownloadPDF && (
              <Button
                onClick={onDownloadPDF}
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.99]"
              >
                <FileDown className="h-5 w-5 mr-2" />
                Download PDF
              </Button>
            )}
          </div>

          {/* Payment Link Section */}
          {invoiceId && (
            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Payment Link</span>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="sm"
                    className={`h-8 px-4 transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] ${
                      isCopied ? 'text-green-600 border-green-600 bg-green-50 hover:bg-green-100' : ''
                    }`}
                  >
                    <Copy className={`h-4 w-4 mr-1.5 ${isCopied ? 'text-green-600' : 'text-gray-500'}`} />
                    {isCopied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    onClick={handleOpenPaymentLink}
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 transition-all duration-200 hover:bg-gray-100 active:scale-[0.98]"
                  >
                    <ExternalLink className="h-4 w-4 mr-1.5 text-gray-500" />
                    Open
                  </Button>
                </div>
              </div>
              <div 
                className="p-3 bg-gray-50 rounded-lg font-mono text-sm text-gray-600 break-all cursor-pointer hover:bg-gray-100 transition-colors duration-200 border border-gray-100"
                onClick={handleCopyLink}
              >
                {paymentLink}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 