import { Card } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { InvoiceFormTabs, TabType } from "./tabs/InvoiceFormTabs";
import { CustomerInfoTab } from "./tabs/CustomerInfoTab";
import { DetailsTab } from "./tabs/DetailsTab";
import { PaymentTab } from "./tabs/PaymentTab";
import { ItemsTab } from "./tabs/ItemsTab";
import { SummaryTab } from "./tabs/SummaryTab";
import { InvoicePreviewContainer } from "./preview/InvoicePreviewContainer";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
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

const TABS = ["from", "details", "items", "payment", "summary"] as const;

interface InvoiceFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export const InvoiceForm = ({ initialData, isEditing }: InvoiceFormProps) => {
  const location = useLocation();
  const customerData = location.state?.customer;
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<TabType>("from");
  const [completedTabs, setCompletedTabs] = useState<TabType[]>([]);
  const { loading: profileLoading } = useProfile();
  const {
    formData,
    setFormData,
    profileData,
    logo,
    signature,
    showDiscount,
    showTax,
    showShipping,
    paymentMethod,
    setShowDiscount,
    setShowTax,
    setShowShipping,
    setPaymentMethod,
    handleInputChange,
    handleDateChange,
    handleItemChange,
    addNewItem,
    removeItem,
    handleAdjustmentChange,
    calculateTotal,
    handleMoveItem
  } = useInvoiceForm(customerData);
  const { createInvoice, updateInvoice, loading } = useInvoices();

  // Handle initial data when editing
  useEffect(() => {
    if (isEditing && initialData) {
      logger.info('Setting initial invoice data for editing', { 
        invoiceId: initialData.id,
        initialData
      });
      
      try {
        setFormData({
          to: {
            name: initialData.billing_name || '',
            email: initialData.billing_email || '',
            phone: initialData.billing_phone || '',
            address: initialData.billing_address || '',
            city: initialData.billing_city || '',
            zip: initialData.billing_zip || '',
            country: initialData.billing_country || '',
          },
          invoiceNumber: initialData.invoice_number,
          issueDate: initialData.issue_date,
          dueDate: initialData.due_date || '',
          currency: initialData.currency,
          items: initialData.invoice_items?.map((item: any) => ({
            name: item.name,
            description: item.description || '',
            quantity: item.quantity,
            rate: item.rate,
          })) || [],
          additionalNotes: initialData.additional_notes || '',
          paymentTerms: initialData.payment_terms || '',
          adjustments: {
            discount: {
              value: initialData.discount_value || 0,
              type: initialData.discount_type || 'percentage'
            },
            tax: {
              value: initialData.tax_value || 0,
              type: initialData.tax_type || 'percentage'
            },
            shipping: {
              value: initialData.shipping_value || 0,
              type: initialData.shipping_type || 'amount'
            }
          }
        });

        // Set adjustment visibility based on values
        setShowDiscount(!!initialData.discount_value);
        setShowTax(!!initialData.tax_value);
        setShowShipping(!!initialData.shipping_value);
        setPaymentMethod(initialData.payment_method || 'bank');

        logger.success('Successfully set initial invoice data');
      } catch (error) {
        logger.error('Failed to set initial invoice data', error);
        toast.error('Failed to load invoice data');
      }
    }
  }, [isEditing, initialData, setFormData, setShowDiscount, setShowTax, setShowShipping, setPaymentMethod]);

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

  const handleTabChange = (value: TabType) => {
    const currentIndex = TABS.indexOf(currentTab);
    const newIndex = TABS.indexOf(value);

    // Allow moving backwards freely
    if (newIndex < currentIndex) {
      setCurrentTab(value);
      return;
    }

    // For forward movement, check if current tab data is valid
    if (isTabComplete(currentTab)) {
      setCurrentTab(value);
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

  const handleSaveInvoice = async () => {
    try {
      const totals = calculateTotal();
      
      if (isEditing && initialData?.id) {
        await updateInvoice(
          initialData.id,
          formData,
          showDiscount,
          showTax,
          showShipping,
          paymentMethod,
          totals
        );
        toast.success("Invoice updated successfully!");
      } else {
        await createInvoice(
          formData,
          showDiscount,
          showTax,
          showShipping,
          paymentMethod,
          totals
        );
        toast.success("Invoice created successfully!");
      }
      
      navigate("/");
    } catch (error) {
      toast.error(isEditing ? "Failed to update invoice" : "Failed to create invoice");
      logger.error(isEditing ? 'Failed to update invoice' : 'Failed to create invoice', error);
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading message={profileLoading ? "Loading profile..." : "Loading invoice data..."} />
      </div>
    );
  }

  return (
    <Card className="p-6 shadow-lg bg-white/80 backdrop-blur-sm">
      <div className="space-y-6">
        <InvoiceFormHeader
          isEditing={isEditing}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
              <InvoiceFormTabs currentTab={currentTab} completedTabs={completedTabs} />

              <div className="mt-6">
                <TabsContent value="from">
                  <CustomerInfoTab
                    formData={formData}
                    onInputChange={handleInputChange}
                  />
                </TabsContent>

                <TabsContent value="details">
                  <DetailsTab
                    formData={formData}
                    onInputChange={handleInputChange}
                    onDateChange={handleDateChange}
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
                    setPaymentMethod={setPaymentMethod}
                    onInputChange={handleInputChange}
                  />
                </TabsContent>

                <TabsContent value="summary">
                  <SummaryTab
                    formData={formData}
                    showDiscount={showDiscount}
                    showTax={showTax}
                    showShipping={showShipping}
                    onInputChange={handleInputChange}
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
              />
            </Tabs>
          </div>

          <div className="lg:sticky lg:top-6">
            <InvoicePreviewContainer
              formData={formData}
              profileData={profileData}
              logo={logo}
              signature={signature}
              calculateTotal={calculateTotal}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
