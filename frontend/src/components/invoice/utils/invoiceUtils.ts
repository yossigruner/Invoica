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
  // Format dates if they exist
  const issueDate = formData.issueDate ? new Date(formData.issueDate).toISOString() : undefined;
  const dueDate = formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined;

  // Extract billing information from the 'to' object
  const {
    name: billingName = '',
    email: billingEmail = '',
    phone: billingPhone = '',
    address: billingAddress = '',
    city: billingCity = '',
    province: billingProvince = '',
    zip: billingZip = '',
    country: billingCountry = '',
    id: customerId = undefined
  } = formData.to || {};

  // Validate required fields
  if (!billingName || typeof billingName !== 'string') {
    throw new Error('Billing name is required and must be a string');
  }

  if (!billingEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail)) {
    throw new Error('A valid billing email is required');
  }

  // Extract adjustment values
  const {
    discount = { type: 'percentage', value: 0 },
    tax = { type: 'percentage', value: 0 },
    shipping = { type: 'amount', value: 0 }
  } = formData.adjustments || {};

  // Transform the data to match the server's expected structure
  const transformedData: Record<string, any> = {
    customerId: customerId || undefined,
    invoiceNumber: formData.invoiceNumber || '',
    issueDate,
    dueDate,
    currency: formData.currency || 'USD',
    paymentMethod: formData.paymentMethod || '',
    paymentTerms: formData.paymentTerms || '',
    additionalNotes: formData.additionalNotes || '',
    status: formData.status || 'DRAFT',
    billingName: String(billingName).trim(),
    billingEmail: String(billingEmail).trim().toLowerCase(),
    billingPhone: String(billingPhone || '').trim(),
    billingAddress: String(billingAddress || '').trim(),
    billingCity: String(billingCity || '').trim(),
    billingProvince: String(billingProvince || '').trim(),
    billingZip: String(billingZip || '').trim(),
    billingCountry: String(billingCountry || '').trim(),
    items: formData.items.map((item: any) => ({
      name: String(item.name || '').trim(),
      description: String(item.description || '').trim(),
      quantity: Number(item.quantity),
      rate: Number(item.rate)
    })),
    discountType: discount.type === 'amount' ? 'fixed' : 'percentage',
    discountValue: Number(discount.value) || 0,
    taxType: tax.type === 'amount' ? 'fixed' : 'percentage',
    taxValue: Number(tax.value) || 0,
    shippingType: shipping.type === 'amount' ? 'fixed' : 'percentage',
    shippingValue: Number(shipping.value) || 0
  };

  // Remove undefined values
  Object.keys(transformedData).forEach(key => {
    if (transformedData[key] === undefined) {
      delete transformedData[key];
    }
  });

  return transformedData;
};
