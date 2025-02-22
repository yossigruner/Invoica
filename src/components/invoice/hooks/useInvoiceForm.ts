import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { calculateAdjustment } from "../utils/invoiceUtils";
import { useInvoiceFormState } from "./useInvoiceFormState";
import { useProfile } from "@/hooks/useProfile";
import { logger } from "@/utils/logger";
import { generateInvoiceNumber } from "../utils/invoiceUtils";

export const useInvoiceForm = (customerData: any) => {
  const location = useLocation();
  const { profile, loading: profileLoading } = useProfile();
  
  // Log the customer data being received
  logger.info('Initializing invoice form state with customer data:', { customerData });

  // Generate initial invoice number
  const initialInvoiceNumber = generateInvoiceNumber();
  logger.info('Generated initial invoice number:', { invoiceNumber: initialInvoiceNumber });

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
  } = useInvoiceFormState(customerData);

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
      logger.info('Loading profile data for invoice', { profileId: profile.id });
      
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
        setLogo(profile.company_logo);
      }

      if (profile.signature) {
        setSignature(profile.signature);
      }
    }
  }, [profile, setProfileData, setLogo, setSignature, setFormData]);

  const handleInputChange = (section: string, field: string, value: string | number) => {
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
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    logger.debug('Handling date change', { field, date });
    
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: date.toISOString()
      }));
    }
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    logger.debug('Handling item change', { index, field, value });
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addNewItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 0, rate: 0, description: "" }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleMoveItem = (fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return {
        ...prev,
        items: newItems
      };
    });
  };

  const handleAdjustmentChange = (
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
  };

  const calculateTotal = () => {
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
  };

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
