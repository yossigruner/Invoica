import { useState, useEffect } from "react";
import { InvoiceFormData, CustomerData, InvoiceFormItem, ProfileData } from "../types/invoice";
import { generateInvoiceNumber } from "../utils/invoiceUtils";
import { logger } from "@/utils/logger";
import { useProfile } from "@/hooks/useProfile";

export const useInvoiceFormState = (customerData: CustomerData | null, initialData?: any) => {
  const { profile } = useProfile();
  
  // Log the raw data
  logger.info('Raw invoice data from database:', { 
    id: initialData?.id,
    customerId: initialData?.customerId,
    customer_id: initialData?.customer_id,
    billingName: initialData?.billingName,
    billing_name: initialData?.billing_name,
    billingAddress: initialData?.billingAddress,
    billing_address: initialData?.billing_address,
    billingZip: initialData?.billingZip,
    billing_zip: initialData?.billing_zip,
    billingCity: initialData?.billingCity,
    billing_city: initialData?.billing_city,
    billingCountry: initialData?.billingCountry,
    billing_country: initialData?.billing_country,
    billingEmail: initialData?.billingEmail,
    billing_email: initialData?.billing_email,
    billingPhone: initialData?.billingPhone,
    billing_phone: initialData?.billing_phone,
    fullInitialData: initialData,
    customerData: {
      id: customerData?.id,
      name: customerData?.name,
      address: customerData?.address,
      zip: customerData?.zip,
      city: customerData?.city,
      country: customerData?.country,
      email: customerData?.email,
      phone: customerData?.phone
    },
    profileCurrency: profile?.preferredCurrency
  });

  const initialItem: InvoiceFormItem = {
    name: "",
    description: "",
    quantity: 0,
    rate: 0,
    amount: 0
  };

  // Map initial items if they exist, otherwise use default empty item
  let initialItems = [initialItem];

  if (initialData) {
    // Try to get items from different possible locations in the data
    const itemsToMap = initialData.items || initialData.invoice_items || [];
    
    if (Array.isArray(itemsToMap) && itemsToMap.length > 0) {
      try {
        initialItems = itemsToMap.map((item: any) => {
          logger.info('Processing item from database:', { item });
          return {
            name: item.name || "",
            description: item.description || "",
            quantity: Number(item.quantity) || 0,
            rate: Number(item.rate) || 0,
            amount: Number(item.quantity || 0) * Number(item.rate || 0)
          };
        });
        logger.info('Successfully mapped items:', { 
          count: initialItems.length,
          mappedItems: initialItems 
        });
      } catch (error) {
        logger.error('Failed to map items:', error);
        initialItems = [initialItem];
      }
    } else {
      logger.warn('No valid items array found in initial data', {
        itemsToMap,
        initialData
      });
    }
  }

  // Get initial payment method from initialData, fallback to 'bank'
  const initialPaymentMethod = initialData?.paymentMethod || initialData?.payment_method || "bank";
  logger.info('Initial payment method:', { initialPaymentMethod });

  // Check if we have any adjustment values in the initial data
  const hasInitialDiscount = !!(initialData?.discountValue || initialData?.discount_value);
  const hasInitialTax = !!(initialData?.taxValue || initialData?.tax_value);
  const hasInitialShipping = !!(initialData?.shippingValue || initialData?.shipping_value);

  logger.info('Initial adjustments:', {
    hasDiscount: hasInitialDiscount,
    hasTax: hasInitialTax,
    hasShipping: hasInitialShipping,
    discountValue: initialData?.discountValue || initialData?.discount_value,
    taxValue: initialData?.taxValue || initialData?.tax_value,
    shippingValue: initialData?.shippingValue || initialData?.shipping_value
  });

  const [formData, setFormData] = useState<InvoiceFormData>({
    to: {
      name: initialData?.billingName || customerData?.name || "",
      email: initialData?.billingEmail || customerData?.email || "",
      phone: initialData?.billingPhone || customerData?.phone || "",
      address: initialData?.billingAddress || customerData?.address || "",
      city: initialData?.billingCity || customerData?.city || "",
      province: initialData?.billingProvince || customerData?.province || "",
      zip: initialData?.billingZip || customerData?.zip || "",
      country: initialData?.billingCountry || customerData?.country || "",
    },
    invoiceNumber: initialData?.invoiceNumber || generateInvoiceNumber(),
    issueDate: initialData?.issueDate || new Date().toISOString(),
    dueDate: initialData?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    currency: initialData?.currency || profile?.preferredCurrency || "USD",
    items: initialItems.map(item => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.quantity * item.rate
    })),
    adjustments: {
      discount: {
        type: initialData?.discountType === 'fixed' ? 'amount' : 'percentage',
        value: initialData?.discountValue || 0
      },
      tax: {
        type: initialData?.taxType === 'fixed' ? 'amount' : 'percentage',
        value: initialData?.taxValue || 0
      },
      shipping: {
        type: initialData?.shippingType === 'fixed' ? 'amount' : 'percentage',
        value: initialData?.shippingValue || 0
      }
    },
    paymentTerms: initialData?.paymentTerms || "",
    additionalNotes: initialData?.additionalNotes || "",
    paymentMethod: initialPaymentMethod
  });

  // Log the final form data
  logger.info('Initial form data set:', {
    hasItems: formData.items.length > 0,
    itemsCount: formData.items.length,
    items: formData.items,
    fullFormData: formData,
    initialDataFields: {
      billing_address: initialData?.billing_address,
      address: customerData?.address
    }
  });

  // Add effect to monitor items changes
  useEffect(() => {
    logger.info('Form items changed:', {
      itemsCount: formData.items.length,
      items: formData.items
    });
  }, [formData.items]);

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [logo, setLogo] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [showDiscount, setShowDiscount] = useState(hasInitialDiscount);
  const [showTax, setShowTax] = useState(hasInitialTax);
  const [showShipping, setShowShipping] = useState(hasInitialShipping);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "cash" | "card">(initialPaymentMethod as "bank" | "cash" | "card");

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
