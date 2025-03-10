import { useCallback, useEffect } from "react";
import { useInvoiceFormState } from "./useInvoiceFormState";
import { CustomerData, InvoiceFormData } from "../types/invoice";
import { calculateAdjustment } from "../utils/invoiceUtils";
import { logger } from "@/utils/logger";

export const useInvoiceForm = (customerData: CustomerData | null, initialData?: any) => {
  logger.info('Initializing invoice form with:', { 
    customerData, 
    hasInitialData: !!initialData,
    initialItemsCount: initialData?.items?.length || 0,
    initialItems: initialData?.items
  });

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
  } = useInvoiceFormState(customerData, initialData);

  // Log form data whenever items change
  useEffect(() => {
    logger.info('Form items updated:', {
      itemsCount: formData.items.length,
      items: formData.items
    });
  }, [formData.items]);

  // Synchronize payment method with form data
  useEffect(() => {
    logger.info('Payment method changed:', { paymentMethod });
  }, [paymentMethod]);

  const handleInputChange = useCallback((section: keyof InvoiceFormData | "", field: string, value: string | number) => {
    setFormData(prev => {
      if (section === "") {
        // Log payment-related changes
        if (field === "paymentMethod" || field === "paymentTerms") {
          logger.info('Payment field updated:', { field, value });
        }
        return {
          ...prev,
          [field]: value
        };
      }
      
      const sectionKey = section as keyof InvoiceFormData;
      const sectionData = prev[sectionKey] as Record<string, unknown>;
      
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value
        }
      };
    });
  }, [setFormData]);

  const handleDateChange = useCallback((field: string, date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: date.toISOString()
      }));
    }
  }, [setFormData]);

  const handleItemChange = useCallback((index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const oldItem = newItems[index];
      const newItem = {
        ...oldItem,
        [field]: value
      };

      // Calculate amount if quantity or rate changes
      if (field === 'quantity' || field === 'rate') {
        const quantity = field === 'quantity' ? Number(value) : Number(oldItem.quantity);
        const rate = field === 'rate' ? Number(value) : Number(oldItem.rate);
        newItem.amount = quantity * rate;
      }

      newItems[index] = newItem;
      
      logger.info('Updated item:', { 
        index, 
        field, 
        value,
        oldItem,
        newItem
      });
      
      return { ...prev, items: newItems };
    });
  }, [setFormData]);

  const addNewItem = useCallback(() => {
    setFormData(prev => {
      const newItem = {
        name: "",
        description: "",
        quantity: 0,
        rate: 0,
        amount: 0
      };
      logger.info('Adding new item', { newItem });
      return {
        ...prev,
        items: [...prev.items, newItem]
      };
    });
  }, [setFormData]);

  const removeItem = useCallback((index: number) => {
    setFormData(prev => {
      logger.info('Removing item', { index, item: prev.items[index] });
      return {
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      };
    });
  }, [setFormData]);

  const handleMoveItem = useCallback((fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const items = [...prev.items];
      const [movedItem] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, movedItem);
      logger.info('Moving item', { fromIndex, toIndex, movedItem });
      return { ...prev, items };
    });
  }, [setFormData]);

  const handleAdjustmentChange = useCallback((
    type: 'discount' | 'tax' | 'shipping',
    field: 'value' | 'type',
    value: number | 'amount' | 'percentage'
  ) => {
    setFormData(prev => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        [type]: {
          ...prev.adjustments[type],
          [field]: value
        }
      }
    }));
  }, [setFormData]);

  const calculateTotal = useCallback(() => {
    const subtotal = formData.items.reduce((sum, item) => 
      sum + (Number(item.quantity) * Number(item.rate)), 0
    );

    const discount = calculateAdjustment(subtotal, formData.adjustments.discount);
    const afterDiscount = subtotal - discount;
    const tax = calculateAdjustment(afterDiscount, formData.adjustments.tax);
    const shipping = calculateAdjustment(subtotal, formData.adjustments.shipping);

    const total = afterDiscount + tax + shipping;

    return {
      subtotal,
      discount,
      tax,
      shipping,
      total
    };
  }, [formData]);

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
    handleInputChange,
    handleDateChange,
    handleItemChange,
    addNewItem,
    removeItem,
    handleMoveItem,
    handleAdjustmentChange,
    calculateTotal
  };
};
