import { Card } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { InvoiceFormTabs, TabType } from "./tabs/InvoiceFormTabs";
import { CustomerInfoTab } from "./tabs/CustomerInfoTab";
import { DetailsTab } from "./tabs/DetailsTab";
import { PaymentTab } from "./tabs/PaymentTab";
import { ItemsTab } from "./tabs/ItemsTab";
import { SummaryTab } from "./tabs/SummaryTab";
import { InvoicePreviewContainer } from "./preview/InvoicePreviewContainer";
import { useState, useEffect } from "react";
import { useInvoiceForm } from "./hooks/useInvoiceForm";
import { InvoiceFormHeader } from "./header/InvoiceFormHeader";
import { InvoiceFormNavigation } from "./navigation/InvoiceFormNavigation";
import { useProfile } from "@/hooks/useProfile";
import { useLocation, useNavigate } from "react-router-dom";
import { useInvoices } from "@/hooks/useInvoices";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { Loading } from "@/components/ui/loading";
import { CustomerData, InvoiceFormData, InvoiceFormItem, ProfileData } from "./types/invoice";
import { Invoice } from '@/api/invoices';
import { Save, Mail, MessageSquare, FileDown } from "lucide-react";
import html2pdf from "html2pdf.js";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { InvoicePreview } from "./InvoicePreview";

const TABS = ["from", "details", "items", "payment", "summary"] as const;

interface InvoiceFormProps {
  initialData?: Invoice | null;
  isEditing?: boolean;
}

interface PreviewProps {
  profileData: ProfileData | null;
  formData: InvoiceFormData;
  showDiscount: boolean;
  showTax: boolean;
  showShipping: boolean;
}

type InputChangeHandler = (section: keyof InvoiceFormData | "", field: string, value: string | number) => void;

export const InvoiceForm = ({ initialData, isEditing }: InvoiceFormProps) => {
  const location = useLocation();
  const state = location.state as { customer?: CustomerData };
  const customerData = state?.customer || null;
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<TabType>("from");
  const [completedTabs, setCompletedTabs] = useState<TabType[]>([]);
  const { profile, isLoading: profileLoading } = useProfile();

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

  const handleNext = () => {
    const currentIndex = TABS.indexOf(currentTab);
    if (currentIndex < TABS.length - 1) {
      setCurrentTab(TABS[currentIndex + 1]);
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
    totals: ReturnType<typeof calculateTotal>
  ) => {
    logger.info('Transforming form data:', {
      formData,
      showDiscount,
      showTax,
      showShipping,
      paymentMethod
    });

    // Transform the data to match the server's expected structure
    const transformedData = {
      invoiceNumber: formData.invoiceNumber,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      currency: formData.currency,
      paymentMethod: paymentMethod,
      paymentTerms: formData.paymentTerms || '',
      additionalNotes: formData.additionalNotes || '',
      billingName: formData.to.name,
      billingEmail: formData.to.email,
      billingPhone: formData.to.phone || '',
      billingAddress: formData.to.address,
      billingCity: formData.to.city,
      billingProvince: formData.to.province || '',
      billingZip: formData.to.zip,
      billingCountry: formData.to.country,
      status: 'DRAFT' as const,
      items: formData.items.map((item: InvoiceFormItem) => ({
        name: item.name,
        description: item.description || '',
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      })),
      discountType: showDiscount ? (formData.adjustments.discount.type === 'amount' ? 'fixed' : 'percentage') : undefined,
      discountValue: showDiscount ? Number(formData.adjustments.discount.value) : undefined,
      taxType: showTax ? (formData.adjustments.tax.type === 'amount' ? 'fixed' : 'percentage') : undefined,
      taxValue: showTax ? Number(formData.adjustments.tax.value) : undefined,
      shippingType: showShipping ? (formData.adjustments.shipping.type === 'amount' ? 'fixed' : 'percentage') : undefined,
      shippingValue: showShipping ? Number(formData.adjustments.shipping.value) : undefined,
      customerId: formData.to.id || undefined
    };

    logger.info('Transformed data:', transformedData);

    return transformedData;
  };

  const handleSaveInvoice = async () => {
    try {
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
      const transformedData = transformFormData(formData, showDiscount, showTax, showShipping, paymentMethod, totals);
      
      logger.info('Submitting invoice with data:', {
        formData,
        transformedData,
        isEditing,
        initialData,
        invoiceId: initialData?.id
      });
      
      if (isEditing && initialData?.id) {
        logger.info('Updating invoice:', { id: initialData.id });
        const response = await updateInvoice({
          id: initialData.id,
          data: transformedData
        });
        logger.info('Update response:', response);
        toast.success("Invoice updated successfully!");
        navigate("/");
      } else {
        const response = await createInvoice(transformedData);
        logger.info('Create response:', response);
        toast.success("Invoice created successfully!");
        navigate("/");
      }
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
        formData,
        isEditing,
        invoiceId: initialData?.id,
        errorDetails: error.response?.data
      });
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const element = document.getElementById('invoice-preview');
      if (!element) {
        toast.error("Invoice preview not found");
        return;
      }

      const opt = {
        margin: [0.2, 0.2, 0.2, 0.2] as [number, number, number, number],
        filename: `invoice-${formData.invoiceNumber}-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 1,
          useCORS: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4',
          orientation: 'portrait',
          compress: true,
          precision: 16
        },
        pagebreak: { mode: 'avoid-all' }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success("PDF generated successfully!");
    } catch (error) {
      logger.error('Failed to generate PDF:', error);
      toast.error("Failed to generate PDF");
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
      <div className="container mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {isEditing ? 'Update your invoice details' : 'Fill in the details to create a new invoice'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveInvoice}
                      disabled={invoicesLoading}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {invoicesLoading ? "Saving..." : isEditing ? "Update" : "Save"}
                    </Button>
                    <Button
                      onClick={handleGeneratePDF}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FileDown className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <InvoiceFormTabs
                    currentTab={currentTab}
                    completedTabs={completedTabs}
                    onTabChange={handleTabChange}
                  >
                    <div className="mt-6 max-w-2xl mx-auto">
                      <TabsContent value="from" className="px-1">
                        <CustomerInfoTab
                          formData={formData}
                          onInputChange={handleInputChange}
                        />
                      </TabsContent>

                      <TabsContent value="details" className="px-1">
                        <DetailsTab
                          formData={formData}
                          onInputChange={handleInputChange}
                          onDateChange={handleDateChange}
                          isEditing={isEditing}
                        />
                      </TabsContent>

                      <TabsContent value="items" className="px-1">
                        <ItemsTab
                          formData={formData}
                          onItemChange={handleItemChange}
                          onAddItem={addNewItem}
                          onRemoveItem={removeItem}
                          onMoveItem={handleMoveItem}
                        />
                      </TabsContent>

                      <TabsContent value="payment" className="px-1">
                        <PaymentTab
                          formData={formData}
                          paymentMethod={paymentMethod}
                          setPaymentMethod={(value: string) => setPaymentMethod(value as "bank" | "cash" | "card")}
                          onInputChange={handleInputChange}
                        />
                      </TabsContent>

                      <TabsContent value="summary" className="px-1">
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
                </div>

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

          {/* Live Preview Section */}
          <div>
            <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
                <div id="invoice-preview">
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
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
