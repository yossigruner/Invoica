import { format } from "date-fns";
import { convert } from "@lorefnon/currency-in-words";

export const generateInvoiceNumber = () => {
  const date = new Date();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${format(date, 'yyyyMMdd')}-${randomNum}`;
};

export const calculateAdjustment = (
  amount: number,
  adjustment: { value: number; type: 'amount' | 'percentage' }
) => {
  if (adjustment.type === 'amount') {
    return adjustment.value;
  }
  return (amount * adjustment.value) / 100;
};

export function formatAmountInWords(amount: number, currency: string): string {
  try {
    // Convert the amount to a string with 2 decimal places
    const amountStr = amount.toFixed(2);
    
    // Convert to words using the international format
    const words = convert(amountStr, { format: 'intl', lang: 'en' });
    
    // Add the currency
    const result = `${words} ${currency}`;
    
    // Capitalize the first letter
    return result.charAt(0).toUpperCase() + result.slice(1);
  } catch (error) {
    // Fallback in case of any error
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export interface PaymentInfo {
  invoiceNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
}

export function handleCreditCardPayment(paymentInfo: PaymentInfo): Promise<void> {
  // This is a placeholder function that would integrate with your payment processor
  // You would typically integrate with Stripe, PayPal, or another payment processor here
  return new Promise((resolve, reject) => {
    try {
      // Here you would:
      // 1. Create a payment intent with your payment processor
      // 2. Redirect to the payment page or open a payment modal
      // 3. Handle the payment result
      console.log('Processing payment:', paymentInfo);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export const transformFormData = (formData: any) => {
  if (!formData.currency) {
    throw new Error('Currency is required');
  }

  // Log date values for debugging
  console.log('Transforming form data dates:', {
    issueDate: formData.issueDate,
    dueDate: formData.dueDate,
    rawFormData: formData
  });

  // Log payment information
  console.log('Payment information:', {
    paymentMethod: formData.paymentMethod,
    paymentTerms: formData.paymentTerms,
    rawFormData: formData
  });

  // Ensure dates are in ISO format and handle undefined/null cases
  const issueDate = formData.issueDate ? new Date(formData.issueDate).toISOString() : null;
  const dueDate = formData.dueDate ? new Date(formData.dueDate).toISOString() : null;

  // Log date transformations
  console.log('Date transformation:', {
    original: {
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
    },
    transformed: {
      issueDate,
      dueDate,
    }
  });

  if (!issueDate) {
    throw new Error('Issue date is required');
  }

  if (!dueDate) {
    throw new Error('Due date is required');
  }

  const transformedData = {
    customerId: formData.to.id,
    invoiceNumber: formData.invoiceNumber,
    issueDate,
    dueDate,
    currency: formData.currency,
    paymentMethod: formData.paymentMethod,
    paymentTerms: formData.paymentTerms,
    additionalNotes: formData.additionalNotes || '',
    status: formData.status || 'DRAFT',
    billingName: formData.to.name,
    billingEmail: formData.to.email,
    billingPhone: formData.to.phone,
    billingAddress: formData.to.address,
    billingCity: formData.to.city,
    billingZip: formData.to.zip,
    billingCountry: formData.to.country,
    items: formData.items.map((item: any) => ({
      name: item.name,
      description: item.description,
      quantity: Number(item.quantity),
      rate: Number(item.rate)
    })),
    discountType: formData.adjustments?.discount?.type || 'percentage',
    discountValue: formData.adjustments?.discount?.value ? Number(formData.adjustments.discount.value) : 0,
    taxType: formData.adjustments?.tax?.type || 'percentage',
    taxValue: formData.adjustments?.tax?.value ? Number(formData.adjustments.tax.value) : 0,
    shippingType: formData.adjustments?.shipping?.type || 'amount',
    shippingValue: formData.adjustments?.shipping?.value ? Number(formData.adjustments.shipping.value) : 0
  };

  // Enhanced logging for debugging
  console.log('Transformed data:', {
    ...transformedData,
    payment: {
      method: transformedData.paymentMethod,
      terms: transformedData.paymentTerms
    },
    summary: {
      additionalNotes: transformedData.additionalNotes,
      adjustments: {
        discount: {
          type: transformedData.discountType,
          value: transformedData.discountValue
        },
        tax: {
          type: transformedData.taxType,
          value: transformedData.taxValue
        },
        shipping: {
          type: transformedData.shippingType,
          value: transformedData.shippingValue
        }
      }
    }
  });

  return transformedData;
};
