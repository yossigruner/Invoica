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
