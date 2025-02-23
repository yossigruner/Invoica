import { useState, useEffect } from "react";
import { InvoiceFormData, CustomerData, InvoiceFormItem, ProfileData } from "../types/invoice";
import { generateInvoiceNumber } from "../utils/invoiceUtils";
import { logger } from "@/utils/logger";

export const useInvoiceFormState = (customerData: CustomerData | null, initialData?: any) => {
  // Log the raw data
  logger.info('Raw invoice data from database:', { 
    id: initialData?.id,
    hasItems: !!initialData?.items,
    itemsArray: Array.isArray(initialData?.items),
    itemsLength: initialData?.items?.length,
    rawItems: initialData?.items,
    fullInitialData: initialData
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
            id: item.id,
            invoice_id: item.invoice_id,
            name: item.name || "",
            description: item.description || "",
            quantity: Number(item.quantity) || 0,
            rate: Number(item.rate) || 0,
            amount: Number(item.amount) || 0,
            created_at: item.created_at,
            updated_at: item.updated_at
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

  const [formData, setFormData] = useState<InvoiceFormData>({
    to: {
      name: customerData?.name ?? initialData?.billing_name ?? "",
      address: customerData?.address ?? initialData?.billing_address ?? "",
      zip: customerData?.zip ?? initialData?.billing_zip ?? "",
      city: customerData?.city ?? initialData?.billing_city ?? "",
      country: customerData?.country ?? initialData?.billing_country ?? "",
      email: customerData?.email ?? initialData?.billing_email ?? "",
      phone: customerData?.phone ?? initialData?.billing_phone ?? "",
    },
    invoiceNumber: initialData?.invoice_number ?? generateInvoiceNumber(),
    issueDate: initialData?.issue_date ?? new Date().toISOString(),
    dueDate: initialData?.due_date ?? "",
    currency: initialData?.currency ?? "USD",
    items: initialItems,
    additionalNotes: initialData?.additional_notes ?? "",
    paymentTerms: initialData?.payment_terms ?? "",
    paymentMethod: initialData?.payment_method ?? "bank",
    adjustments: {
      discount: { 
        value: initialData?.discount_value ?? 0, 
        type: initialData?.discount_type ?? 'percentage' as const 
      },
      tax: { 
        value: initialData?.tax_value ?? 0, 
        type: initialData?.tax_type ?? 'percentage' as const 
      },
      shipping: { 
        value: initialData?.shipping_value ?? 0, 
        type: initialData?.shipping_type ?? 'amount' as const 
      },
    },
  });

  // Log the final form data
  logger.info('Initial form data set:', {
    hasItems: formData.items.length > 0,
    itemsCount: formData.items.length,
    items: formData.items,
    fullFormData: formData
  });

  // Add effect to monitor items changes
  useEffect(() => {
    logger.info('Form items changed:', {
      itemsCount: formData.items.length,
      items: formData.items
    });
  }, [formData.items]);

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [showDiscount, setShowDiscount] = useState(initialData?.discount_value > 0);
  const [showTax, setShowTax] = useState(initialData?.tax_value > 0);
  const [showShipping, setShowShipping] = useState(initialData?.shipping_value > 0);
  const [paymentMethod, setPaymentMethod] = useState<string>(initialData?.payment_method || "bank");

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
