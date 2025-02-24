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
        address: profile.address || '',
        city: profile.city || '',
        zip: profile.zip || '',
        country: profile.country || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bankName: profile.bankName || '',
        accountName: profile.accountName || '',
        accountNumber: profile.accountNumber || '',
        swiftCode: profile.swiftCode || '',
        iban: profile.iban || ''
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
    // Log payment information
    console.log('Payment information:', {
      paymentMethod,
      paymentTerms: formData.paymentTerms,
      formDataPaymentMethod: formData.paymentMethod
    });

    return {
      invoiceNumber: formData.invoiceNumber,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      currency: formData.currency,
      paymentMethod: paymentMethod,
      paymentTerms: formData.paymentTerms,
      billingName: formData.to.name,
      billingEmail: formData.to.email,
      billingPhone: formData.to.phone,
      billingAddress: formData.to.address,
      billingCity: formData.to.city,
      billingZip: formData.to.zip,
      billingCountry: formData.to.country,
      status: 'DRAFT' as const,
      items: formData.items.map((item: InvoiceFormItem) => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
      })),
      discountValue: showDiscount ? formData.adjustments.discount.value : undefined,
      discountType: showDiscount ? formData.adjustments.discount.type : undefined,
      taxValue: showTax ? formData.adjustments.tax.value : undefined,
      taxType: showTax ? formData.adjustments.tax.type : undefined,
      shippingValue: showShipping ? formData.adjustments.shipping.value : undefined,
      shippingType: showShipping ? formData.adjustments.shipping.type : undefined,
      customerId: formData.to.id || undefined
    };
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

      const totals = calculateTotal();
      const transformedData = transformFormData(formData, showDiscount, showTax, showShipping, paymentMethod, totals);
      
      logger.info('Submitting invoice with data:', {
        formData,
        transformedData,
        isEditing,
        initialData
      });
      
      if (isEditing && initialData?.id) {
        await updateInvoice({
          id: initialData.id,
          data: transformedData
        });
        toast.success("Invoice updated successfully!");
        navigate("/");
      } else {
        await createInvoice(transformedData);
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
      logger.error(isEditing ? 'Failed to update invoice' : 'Failed to create invoice', { error, formData });
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
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left column - Form */}
        <div className="space-y-6">
          <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
              <InvoiceFormTabs currentTab={currentTab} completedTabs={completedTabs} />

              <div className="mt-6">
                <TabsContent value="from">
                  <CustomerInfoTab
                    formData={formData}
                    onInputChange={handleInputChange as InputChangeHandler}
                  />
                </TabsContent>

                <TabsContent value="details">
                  <DetailsTab
                    formData={formData}
                    onInputChange={handleInputChange as InputChangeHandler}
                    onDateChange={handleDateChange}
                    isEditing={isEditing}
                  />
                </TabsContent>

                <TabsContent value="items">
                  <ItemsTab
                    formData={formData}
                    onItemChange={handleItemChange}
                    onRemoveItem={removeItem}
                    onMoveItem={handleMoveItem}
                    onAddItem={addNewItem}
                  />
                </TabsContent>

                <TabsContent value="payment">
                  <PaymentTab
                    formData={formData}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={(value: string) => setPaymentMethod(value as "bank" | "other")}
                    onInputChange={handleInputChange as InputChangeHandler}
                  />
                </TabsContent>

                <TabsContent value="summary">
                  <SummaryTab
                    formData={formData}
                    showDiscount={showDiscount}
                    showTax={showTax}
                    showShipping={showShipping}
                    onInputChange={(section, field, value) => handleInputChange(section as keyof InvoiceFormData | "", field, value)}
                    onShowDiscountChange={setShowDiscount}
                    onShowTaxChange={setShowTax}
                    onShowShippingChange={setShowShipping}
                    onAdjustmentChange={handleAdjustmentChange}
                    calculateTotal={calculateTotal}
                  />
                </TabsContent>
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
            </Tabs>
          </Card>
        </div>

        {/* Right column - Actions and Preview */}
        <div className="space-y-6">
          <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <p className="text-sm text-gray-500 mb-4">Operations and preview</p>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleSaveInvoice}
                  disabled={invoicesLoading}
                  className="p-4 rounded-lg border border-gray-200 hover:border-primary/20 hover:bg-primary/5 transition-colors text-center font-medium flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {invoicesLoading ? "Saving..." : isEditing ? "Update Draft" : "Save Draft"}
                </button>
                <button className="p-4 rounded-lg border border-gray-200 hover:border-primary/20 hover:bg-primary/5 transition-colors text-center flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  Send via Email
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 rounded-lg border border-gray-200 hover:border-primary/20 hover:bg-primary/5 transition-colors text-center flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Send via SMS
                </button>
                <button 
                  onClick={handleGeneratePDF}
                  className="p-4 rounded-lg border border-gray-200 hover:border-primary/20 hover:bg-primary/5 transition-colors text-center flex items-center justify-center gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Generate PDF
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm lg:sticky lg:top-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Live Preview</h2>
                <span className="text-sm text-gray-500">(Updates in real-time as you edit)</span>
              </div>
              <div id="invoice-preview">
                <InvoicePreviewContainer
                  profileData={profileData}
                  formData={formData}
                  showDiscount={showDiscount}
                  showTax={showTax}
                  showShipping={showShipping}
                  calculateTotal={calculateTotal}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
