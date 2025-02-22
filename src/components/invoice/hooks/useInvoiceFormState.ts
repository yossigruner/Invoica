import { useState } from "react";
import { InvoiceFormData } from "../types/invoice";
import { generateInvoiceNumber } from "../utils/invoiceUtils";
import { logger } from "@/utils/logger";
import { useProfile } from "@/hooks/useProfile";

export const useInvoiceFormState = (customerData: any) => {
  const { profile } = useProfile();
  // Log the customer data being received
  logger.info('Initializing invoice form state with customer data:', { customerData });

  // Generate initial invoice number
  const initialInvoiceNumber = generateInvoiceNumber();
  logger.info('Generated initial invoice number:', { invoiceNumber: initialInvoiceNumber });

  const [formData, setFormData] = useState<InvoiceFormData>({
    to: {
      name: customerData?.name || "",
      address: customerData?.address || "",
      zip: customerData?.zip || "",
      city: customerData?.city || "",
      country: customerData?.country || "",
      email: customerData?.email || "",
      phone: customerData?.phone || "",
    },
    invoiceNumber: initialInvoiceNumber,
    issueDate: new Date().toISOString(),
    dueDate: "",
    currency: profile?.preferred_currency || "USD",
    items: [{
      name: "",
      quantity: 0,
      rate: 0,
      description: "",
    }],
    additionalNotes: "",
    paymentTerms: "",
    adjustments: {
      discount: { value: 0, type: 'percentage' as const },
      tax: { value: 0, type: 'percentage' as const },
      shipping: { value: 0, type: 'amount' as const },
    },
  });

  const [profileData, setProfileData] = useState<any>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showTax, setShowTax] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("bank");

  return {
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
  };
};
