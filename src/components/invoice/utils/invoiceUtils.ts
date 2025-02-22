
import { format } from "date-fns";

export const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const timestamp = format(new Date(), 'yyyyMMdd');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

export const calculateAdjustment = (amount: number, adjustment: { value: number; type: 'amount' | 'percentage' }) => {
  if (adjustment.type === 'percentage') {
    return (amount * adjustment.value) / 100;
  }
  return adjustment.value;
};
