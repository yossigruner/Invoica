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
  const { profile, isLoading } = useProfile();
  
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
      logger.info('Setting customer data for invoice', { 
        customerData,
        currentFormData: formData.to
      });
      setFormData(prev => {
        const newData = {
          ...prev,
          to: {
            ...prev.to,
            id: customerData.id || prev.to.id,
            name: customerData.name || prev.to.name,
            email: customerData.email || prev.to.email,
            phone: customerData.phone || prev.to.phone,
            address: customerData.address || prev.to.address,
            city: customerData.city || prev.to.city,
            zip: customerData.zip || prev.to.zip,
            country: customerData.country || prev.to.country,
          }
        };
        logger.info('Updated form data', { 
          oldTo: prev.to,
          newTo: newData.to
        });
        return newData;
      });
    }
  }, [customerData, setFormData, formData.to]);

  // Handle profile data
  useEffect(() => {
    if (profile) {
      logger.info('Loading profile data for invoice', { 
        profileId: profile.id,
        hasLogo: !!profile.companyLogo,
        logoValue: profile.companyLogo?.substring(0, 100),
        hasSignature: !!profile.signature,
        signatureValue: profile.signature?.substring(0, 100),
        preferredCurrency: profile.preferredCurrency,
        isLoading,
        isNewInvoice: !initialData,
        rawProfile: {
          ...profile,
          companyLogo: profile.companyLogo?.substring(0, 100),
          signature: profile.signature?.substring(0, 100)
        }
      });
      
      // First, determine the company name and logo
      const companyName = profile.companyName || `${profile.firstName} ${profile.lastName}`.trim();
      const companyLogo = profile.companyLogo || null;
      
      // Then, set up the profile data with company information taking precedence
      const profileDataToSet: ProfileData = {
        name: companyName,
        // Use company address if available, fall back to personal address
        address: profile.companyAddress || profile.address || '',
        city: profile.companyCity || profile.city || '',
        zip: profile.companyZip || profile.zip || '',
        country: profile.companyCountry || profile.country || '',
        email: profile.companyEmail || profile.email || '',
        phone: profile.companyPhone || profile.phone || '',
        // Banking information
        bankName: profile.bankName || '',
        accountName: profile.accountName || '',
        accountNumber: profile.accountNumber || '',
        swiftCode: profile.swiftCode || '',
        iban: profile.iban || '',
        // Company specific fields
        companyLogo: companyLogo,
        signature: profile.signature || null,
        preferredCurrency: profile.preferredCurrency || '',
        // Optional fields
        cloverApiKey: profile.cloverApiKey,
        cloverMerchantId: profile.cloverMerchantId
      };

      logger.info('Setting profile data:', { 
        hasLogo: !!profileDataToSet.companyLogo,
        hasSignature: !!profileDataToSet.signature,
        logoValue: profileDataToSet.companyLogo?.substring(0, 100),
        signatureValue: profileDataToSet.signature?.substring(0, 100),
        profileKeys: Object.keys(profileDataToSet),
        fullProfileData: {
          ...profileDataToSet,
          companyLogo: profileDataToSet.companyLogo?.substring(0, 100),
          signature: profileDataToSet.signature?.substring(0, 100)
        }
      });
      
      setProfileData(profileDataToSet);
      
      // Set logo and signature separately
      if (companyLogo) {
        logger.info('Setting logo:', {
          logoValue: companyLogo.substring(0, 100),
          logoLength: companyLogo.length,
          isDataUrl: companyLogo.startsWith('data:'),
          isBase64: companyLogo.includes('base64,')
        });
        setLogo(companyLogo);
      }
      
      if (profile.signature) {
        logger.info('Setting signature:', {
          signatureValue: profile.signature.substring(0, 100),
          signatureLength: profile.signature.length,
          isDataUrl: profile.signature.startsWith('data:'),
          isBase64: profile.signature.includes('base64,')
        });
        setSignature(profile.signature);
      }

      // Set currency from profile only for new invoices
      if (!initialData && profile.preferredCurrency) {
        setFormData(prev => ({
          ...prev,
          currency: profile.preferredCurrency || prev.currency
        }));
      }
    }
  }, [profile, setProfileData, setLogo, setSignature, setFormData, initialData, isLoading]);

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
      logger.debug('Setting date in form data', {
        field,
        date,
        isoString: date.toISOString()
      });
      
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