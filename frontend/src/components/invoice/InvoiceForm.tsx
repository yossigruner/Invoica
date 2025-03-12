import { Card } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { InvoiceFormTabs, TabType } from "./tabs/InvoiceFormTabs";
import { CustomerInfoTab } from "./tabs/CustomerInfoTab";
import { DetailsTab } from "./tabs/DetailsTab";
import { PaymentTab } from "./tabs/PaymentTab";
import { ItemsTab } from "./tabs/ItemsTab";
import { SummaryTab } from "./tabs/SummaryTab";
import { useState, useEffect } from "react";
import { useInvoiceForm } from "./hooks/useInvoiceForm";
import { InvoiceFormNavigation } from "./navigation/InvoiceFormNavigation";
import { useProfile } from "@/hooks/useProfile";
import { useLocation, useNavigate } from "react-router-dom";
import { useInvoices } from "@/hooks/useInvoices";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { Loading } from "@/components/ui/loading";
import { CustomerData, InvoiceFormData, } from "./types/invoice";
import { Invoice, CreateInvoiceDto, invoicesApi } from '@/api/invoices';
import { Save, FileDown } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { InvoicePreview } from "./InvoicePreview";
import { InvoiceActionDialog } from "./dialogs/InvoiceActionDialog";

const TABS = ["from", "details", "items", "payment", "summary"] as const;

interface InvoiceFormProps {
  initialData?: Invoice | null;
  isEditing?: boolean;
}


interface FormData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  customerId: string;
  billingName: string;
  billingEmail: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingCountry: string;
  billingPostalCode: string;
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    rate: number;
  }>;
  notes?: string;
  terms?: string;
  discountType?: 'fixed' | 'percentage';
  discountValue?: number;
  taxType?: 'fixed' | 'percentage';
  taxValue?: number;
  shippingType?: 'fixed' | 'percentage';
  shippingValue?: number;
}

interface TransformedData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  customerId: string;
  status: 'DRAFT';
  billingName: string;
  billingEmail: string;
  billingAddress: string;
  billingCity: string;
  billingProvince: string;
  billingZip: string;
  billingCountry: string;
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    rate: number;
  }>;
  paymentMethod: string;
  paymentTerms: string;
  additionalNotes: string;
  discountType?: 'fixed' | 'percentage';
  discountValue?: number;
  taxType?: 'fixed' | 'percentage';
  taxValue?: number;
  shippingType?: 'fixed' | 'percentage';
  shippingValue?: number;
}

export const InvoiceForm = ({ initialData, isEditing }: InvoiceFormProps) => {
  const location = useLocation();
  const state = location.state as { customer?: CustomerData };
  const customerData = state?.customer || null;
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<TabType>("from");
  const [completedTabs, setCompletedTabs] = useState<TabType[]>([]);
  const { profile, isLoading: profileLoading } = useProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [savedInvoiceId, setSavedInvoiceId] = useState<string>();

  const {
    formData,
    setFormData,
    profileData,
    setProfileData,
    logo,
    setLogo,
    signature,
    setSignature,
    showDiscount,
    setShowDiscount,
    showTax,
    setShowTax,
    showShipping,
    setShowShipping,
    paymentMethod,
    setPaymentMethod,
    handleInputChange,
    handleDateChange,
    handleItemChange,
    addNewItem,
    removeItem,
    handleAdjustmentChange,
    calculateTotal,
    handleMoveItem
  } = useInvoiceForm(customerData, initialData);

  const { createInvoice, updateInvoice, isLoading: invoicesLoading } = useInvoices();

  // Update profile data when profile is loaded
  useEffect(() => {
    if (profile) {
      logger.info('Setting profile data:', { profile });
      setProfileData({
        name: profile.companyName || `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.companyEmail || profile.email || '',
        phone: profile.companyPhone || profile.phone || '',
        companyName: profile.companyName || '',
        companyAddress: profile.companyAddress || '',
        companyCity: profile.companyCity || '',
        companyZip: profile.companyZip || '',
        companyCountry: profile.companyCountry || '',
        companyPhone: profile.companyPhone || '',
        companyEmail: profile.companyEmail || '',
        companyWebsite: profile.companyWebsite || '',
        companyRegistration: profile.companyRegistration || '',
        companyVat: profile.companyVat || '',
        bankName: profile.bankName || '',
        accountName: profile.accountName || '',
        accountNumber: profile.accountNumber || '',
        swiftCode: profile.swiftCode || '',
        iban: profile.iban || '',
        companyLogo: profile.companyLogo,
        signature: profile.signature,
        preferredCurrency: profile.preferredCurrency || ''
      });
      
      if (profile.companyLogo) {
        setLogo(profile.companyLogo);
      }
      
      if (profile.signature) {
        setSignature(profile.signature);
      }
    }
  }, [profile, setProfileData, setLogo, setSignature]);

  useEffect(() => {
    logger.info('Form data updated:', {
      itemsCount: formData.items.length,
      items: formData.items
    });
  }, [formData.items]);

  const isTabComplete = (tab: TabType): boolean => {
    switch (tab) {
      case "from":
        return !!formData.to.name;
      case "details":
        return !!formData.invoiceNumber && !!formData.issueDate && !!formData.dueDate;
      case "items":
        return formData.items.length > 0 && formData.items.every(item => 
          item.name && item.quantity > 0 && item.rate > 0
        );
      case "payment":
        return !!formData.paymentTerms;
      case "summary":
        return true; // Summary is always considered complete as it's just a review
      default:
        return false;
    }
  };

  const updateCompletedTabs = () => {
    const completed = TABS.filter(tab => isTabComplete(tab));
    setCompletedTabs(completed);
  };

  // Update completed tabs whenever form data changes
  useEffect(() => {
    updateCompletedTabs();
  }, [formData]);

  const handleTabChange = (value: string) => {
    const tabValue = value as TabType;
    const currentIndex = TABS.indexOf(currentTab);
    const newIndex = TABS.indexOf(tabValue);

    // Allow moving backwards freely
    if (newIndex < currentIndex) {
      setCurrentTab(tabValue);
      return;
    }

    // For forward movement, check if current tab data is valid
    if (isTabComplete(currentTab)) {
      setCurrentTab(tabValue);
    } else {
      const errorMessages = {
        from: "Please enter customer name",
        details: "Please fill in all required invoice details",
        items: "Please add at least one item with valid details",
        payment: "Please enter payment terms",
        summary: ""
      };
      toast.error(errorMessages[currentTab]);
    }
  };

  const handleNext = async () => {
    const currentIndex = TABS.indexOf(currentTab);
    if (currentIndex < TABS.length - 1) {
      setCurrentTab(TABS[currentIndex + 1]);
    } else if (currentIndex === TABS.length - 1) {
      // If we're on the last tab, save the invoice first
      await handleSaveInvoice();
      // Only show the dialog if the save was successful (no error was thrown)
      setShowActionDialog(true);
    }
  };

  const handleBack = () => {
    const currentIndex = TABS.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(TABS[currentIndex - 1]);
    }
  };

  const transformFormData = (
    formData: InvoiceFormData,
    showDiscount: boolean,
    showTax: boolean,
    showShipping: boolean,
    paymentMethod: string,
    totals: {
      subtotal: number;
      total: number;
      discountAmount?: number;
      taxAmount?: number;
      shippingAmount?: number;
    }
  ) => {
    const transformedData: {
      customerId?: string;
      invoiceNumber: string;
      issueDate: string;
      dueDate: string;
      currency: string;
      paymentMethod: string;
      paymentTerms?: string;
      billingName: string;
      billingEmail: string;
      billingPhone?: string;
      billingAddress?: string;
      billingCity?: string;
      billingProvince?: string;
      billingZip?: string;
      billingCountry?: string;
      status: 'DRAFT';
      items: Array<{
        name: string;
        description: string;
        quantity: number;
        rate: number;
      }>;
      additionalNotes?: string;
      discountType?: 'fixed' | 'percentage';
      discountValue?: number;
      taxType?: 'fixed' | 'percentage';
      taxValue?: number;
      shippingType?: 'fixed' | 'percentage';
      shippingValue?: number;
    } = {
      customerId: formData.to.id || undefined,
      invoiceNumber: formData.invoiceNumber,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      currency: formData.currency,
      paymentMethod,
      paymentTerms: formData.paymentTerms || undefined,
      billingName: formData.to.name,
      billingEmail: formData.to.email,
      billingPhone: formData.to.phone || undefined,
      billingAddress: formData.to.address || undefined,
      billingCity: formData.to.city || undefined,
      billingProvince: formData.to.province || undefined,
      billingZip: formData.to.zip || undefined,
      billingCountry: formData.to.country || undefined,
      status: 'DRAFT' as const,
      items: formData.items.map(item => ({
        name: item.name,
        description: item.description || '',
        quantity: Number(item.quantity),
        rate: Number(item.rate)
      })),
      additionalNotes: formData.additionalNotes || undefined,
      discountType: undefined,
      discountValue: undefined,
      taxType: undefined,
      taxValue: undefined,
      shippingType: undefined,
      shippingValue: undefined
    };

    if (showDiscount) {
      transformedData.discountType = formData.adjustments.discount.type === 'amount' ? 'fixed' : 'percentage';
      transformedData.discountValue = Number(formData.adjustments.discount.value);
    }

    if (showTax) {
      transformedData.taxType = 'percentage'; // Always use percentage for tax
      transformedData.taxValue = Number(formData.adjustments.tax.value);
    }

    if (showShipping) {
      transformedData.shippingType = formData.adjustments.shipping.type === 'amount' ? 'fixed' : 'percentage';
      transformedData.shippingValue = Number(formData.adjustments.shipping.value);
    }

    return transformedData;
  };

  const handleSaveInvoice = async () => {
    let transformedData: CreateInvoiceDto | undefined;
    try {
      setIsSaving(true);
      
      // Validate required dates
      if (!formData.issueDate) {
        toast.error("Please set an issue date");
        return;
      }

      if (!formData.dueDate) {
        toast.error("Please set a due date");
        return;
      }

      // Check if we have a valid ID when editing
      if (isEditing && !initialData?.id) {
        toast.error("Invalid invoice ID");
        return;
      }

      const totals = calculateTotal();
      transformedData = transformFormData(formData, showDiscount, showTax, showShipping, paymentMethod, totals);
      
      logger.info('Submitting invoice with transformed data:', {
        transformedData,
        isEditing,
        invoiceId: initialData?.id
      });
      
      let result: Invoice;
      if (isEditing && initialData?.id) {
        const updateData = {
          id: initialData.id,
          data: transformedData
        };
        
        logger.info('Updating invoice:', updateData);
        result = await updateInvoice(updateData);
        toast.success("Invoice updated successfully!");
        navigate("/");
      } else {
        result = await createInvoice(transformedData);
        toast.success("Invoice created successfully!");
        navigate("/");
      }
      setSavedInvoiceId(result.id);
    } catch (error: any) {
      // Handle validation errors
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          error.response.data.message.forEach((msg: string) => {
            toast.error(msg);
          });
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error(isEditing ? "Failed to update invoice" : "Failed to create invoice");
      }
      logger.error(isEditing ? 'Failed to update invoice' : 'Failed to create invoice', { 
        error,
        transformedData,
        isEditing,
        invoiceId: initialData?.id,
        errorDetails: error.response?.data
      });
      throw error; // Re-throw the error so handleNext knows the save failed
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      // Save the invoice first if it hasn't been saved
      if (!savedInvoiceId) {
        await handleSaveInvoice();
      }

      if (!savedInvoiceId) {
        toast.error("Please save the invoice first");
        return;
      }

      // Download the PDF from the server
      const blob = await invoicesApi.downloadPdf(savedInvoiceId);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${formData.invoiceNumber}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      // Append to body, click, and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      logger.error('Failed to download PDF:', error);
      toast.error("Failed to download PDF");
    }
  };

  if (profileLoading || invoicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading message={profileLoading ? "Loading profile..." : "Loading invoice data..."} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Form Section - 50% */}
          <div className="lg:col-span-6">
            <Card className="p-4 sm:p-4 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {isEditing ? 'Update your invoice details' : 'Fill in the details to create a new invoice'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/")}
                      className="w-full sm:w-auto h-9"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveInvoice}
                      disabled={isSaving}
                      className="w-full sm:w-auto h-9 flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <InvoiceFormTabs 
                  currentTab={currentTab} 
                  completedTabs={completedTabs}
                  onTabChange={handleTabChange}
                >
                  <div className="mt-6">
                    <TabsContent value="from">
                      <CustomerInfoTab
                        formData={{
                          to: formData.to
                        }}
                        onInputChange={handleInputChange}
                      />
                    </TabsContent>

                    <TabsContent value="details">
                      <DetailsTab
                        formData={{
                          invoiceNumber: formData.invoiceNumber,
                          issueDate: formData.issueDate,
                          dueDate: formData.dueDate,
                          currency: formData.currency
                        }}
                        onInputChange={handleInputChange}
                        onDateChange={handleDateChange}
                        isEditing={isEditing}
                      />
                    </TabsContent>

                    <TabsContent value="items">
                      <ItemsTab
                        formData={formData}
                        onItemChange={handleItemChange}
                        onAddItem={addNewItem}
                        onRemoveItem={removeItem}
                        onMoveItem={handleMoveItem}
                      />
                    </TabsContent>

                    <TabsContent value="payment">
                      <PaymentTab
                        formData={{
                          paymentTerms: formData.paymentTerms,
                          paymentMethod: formData.paymentMethod
                        }}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        onInputChange={handleInputChange}
                      />
                    </TabsContent>

                    <TabsContent value="summary">
                      <SummaryTab
                        formData={formData}
                        onInputChange={(section: string, field: string, value: string) => handleInputChange(section as keyof InvoiceFormData | "", field, value)}
                        showDiscount={showDiscount}
                        showTax={showTax}
                        showShipping={showShipping}
                        onShowDiscountChange={setShowDiscount}
                        onShowTaxChange={setShowTax}
                        onShowShippingChange={setShowShipping}
                        onAdjustmentChange={handleAdjustmentChange}
                        calculateTotal={calculateTotal}
                      />
                    </TabsContent>
                  </div>
                </InvoiceFormTabs>

                <InvoiceFormNavigation
                  currentTab={currentTab}
                  onNext={handleNext}
                  onBack={handleBack}
                  formData={formData}
                  showDiscount={showDiscount}
                  showTax={showTax}
                  showShipping={showShipping}
                  paymentMethod={paymentMethod}
                  calculateTotal={calculateTotal}
                  isEditing={isEditing}
                  initialData={initialData}
                />
              </div>
            </Card>
          </div>

          {/* Live Preview Section - 50% */}
          <div className="lg:col-span-6 lg:sticky lg:top-4 lg:self-start">
            <Card className="p-4 sm:p-6 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGeneratePDF}
                    className="w-full sm:w-auto h-9 flex items-center justify-center gap-2"
                  >
                    <FileDown className="h-4 w-4" />
                    <span>Download PDF</span>
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <div id="invoice-preview" className="min-w-[800px]">
                    <InvoicePreview
                      formData={formData}
                      showDiscount={showDiscount}
                      showTax={showTax}
                      showShipping={showShipping}
                      profileData={profileData}
                      calculateTotal={calculateTotal}
                      logo={logo}
                      signature={signature}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <InvoiceActionDialog
        isOpen={showActionDialog}
        onClose={() => {
          setShowActionDialog(false);
          navigate("/");
        }}
        onSave={handleSaveInvoice}
        onDownloadPDF={handleGeneratePDF}
        isEditing={!!isEditing}
        invoiceId={savedInvoiceId}
        isSaving={isSaving}
        recipientEmail={formData.to.email}
        recipientPhone={formData.to.phone}
      />
    </div>
  );
};
