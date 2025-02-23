import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { calculateAdjustment } from "../components/invoice/utils/invoiceUtils";
import { useInvoiceFormState } from "../components/invoice/hooks/useInvoiceFormState";
import { useProfile } from "@/hooks/useProfile";
import { logger } from "@/utils/logger";
import { generateInvoiceNumber } from "../components/invoice/utils/invoiceUtils";
import { InvoiceFormItem, CustomerData, ProfileData } from "../components/invoice/types/invoice";

export const useInvoiceForm = (customerData: CustomerData | null, initialData?: any) => {
  const location = useLocation();
  const { profile, loading: profileLoading } = useProfile();
  
  // Log the customer data being received
  logger.info('Initializing invoice form with data:', { 
    customerData,
    hasInitialData: !!initialData,
    initialItems: initialData?.items
  });

  // Generate initial invoice number
  const initialInvoiceNumber = generateInvoiceNumber();

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

  // Handle customer data when creating invoice from customer
  useEffect(() => {
    if (customerData) {
      logger.info('Setting customer data for invoice', { customerData });
      setFormData(prev => ({
        ...prev,
        to: {
          name: customerData.name || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          address: customerData.address || '',
          city: customerData.city || '',
          province: customerData.province || '',
          zip: customerData.zip || '',
          country: customerData.country || '',
        }
      }));
    }
  }, [customerData, setFormData]);

  // Handle profile data
  useEffect(() => {
    if (profile) {
      logger.info('Loading profile data for invoice', { 
        profileId: profile.id,
        hasLogo: !!profile.company_logo,
        logoValue: profile.company_logo
      });
      
      setProfileData({
        name: profile.company_name || `${profile.first_name} ${profile.last_name}`.trim(),
        address: profile.address || '',
        city: profile.city || '',
        zip: profile.zip || '',
        country: profile.country || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bankName: profile.bank_name || '',
        accountName: profile.account_name || '',
        accountNumber: profile.account_number || '',
        swiftCode: profile.swift_code || '',
        iban: profile.iban || ''
      });

      // Set the currency from profile's preferred currency
      setFormData(prev => ({
        ...prev,
        currency: profile.preferred_currency || 'USD'
      }));

      if (profile.company_logo) {
        logger.info('Setting logo from profile', { logo: profile.company_logo });
        setLogo(profile.company_logo);
      } else {
        logger.info('No logo found in profile');
      }

      if (profile.signature) {
        setSignature(profile.signature);
      }
    }
  }, [profile, setProfileData, setLogo, setSignature, setFormData]);

  const handleInputChange = useCallback((section: string, field: string, value: string | number) => {
    logger.debug('Handling input change', { section, field, value });
    
    setFormData(prev => {
      if (section === "to") {
        return {
          ...prev,
          to: {
            ...prev.to,
            [field]: value
          }
        };
      }
      
      return {
        ...prev,
        [field]: value
      };
    });
  }, [setFormData]);

  const handleDateChange = useCallback((field: string, date: Date | undefined) => {
    logger.debug('Handling date change', { field, date });
    
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: date.toISOString()
      }));
    }
  }, [setFormData]);

  const handleItemChange = useCallback((index: number, field: string, value: string | number) => {
    logger.debug('Handling item change', { index, field, value });
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          // Update amount when quantity or rate changes
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate);
          }
          return updatedItem;
        }
        return item;
      })
    }));
  }, [setFormData]);

  const addNewItem = useCallback(() => {
    logger.debug('Adding new item');
    const newItem: InvoiceFormItem = {
      name: "",
      description: "",
      quantity: 0,
      rate: 0,
      amount: 0
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  }, [setFormData]);

  const removeItem = useCallback((index: number) => {
    logger.debug('Removing item at index', index);
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }, [setFormData]);

  const handleMoveItem = useCallback((fromIndex: number, toIndex: number) => {
    logger.debug('Moving item', { fromIndex, toIndex });
    setFormData(prev => {
      const newItems = [...prev.items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return {
        ...prev,
        items: newItems
      };
    });
  }, [setFormData]);

  const handleAdjustmentChange = useCallback((
    type: 'discount' | 'tax' | 'shipping',
    field: 'value' | 'type',
    value: number | 'amount' | 'percentage'
  ) => {
    logger.debug('Handling adjustment change', { type, field, value });
    
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
    const subtotal = formData.items.reduce((total, item) => {
      return total + (Number(item.quantity) * Number(item.rate));
    }, 0);

    const discountAmount = showDiscount ? calculateAdjustment(subtotal, formData.adjustments.discount) : 0;
    const taxAmount = showTax ? calculateAdjustment(subtotal - discountAmount, formData.adjustments.tax) : 0;
    const shippingAmount = showShipping ? calculateAdjustment(subtotal, formData.adjustments.shipping) : 0;

    return {
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      shipping: shippingAmount,
      total: subtotal - discountAmount + taxAmount + shippingAmount
    };
  }, [formData.items, formData.adjustments, showDiscount, showTax, showShipping]);

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