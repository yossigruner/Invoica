import { format } from "date-fns";

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

const ONES = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen"
];

const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
];

const SCALES = ["", "thousand", "million", "billion", "trillion"];

function convertLessThanThousand(num: number): string {
  if (num === 0) return "";
  
  if (num < 20) return ONES[num];
  
  if (num < 100) {
    const remainder = num % 10;
    return TENS[Math.floor(num / 10)] + (remainder ? "-" + ONES[remainder] : "");
  }
  
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;
  return ONES[hundreds] + " hundred" + (remainder ? " and " + convertLessThanThousand(remainder) : "");
}

export function numberToWords(num: number): string {
  if (num === 0) return "zero";
  
  let words = "";
  let scaleIndex = 0;
  
  // Handle negative numbers
  if (num < 0) {
    words = "negative ";
    num = Math.abs(num);
  }
  
  // Split number into groups of three digits and convert each group
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk !== 0) {
      const chunkWords = convertLessThanThousand(chunk);
      words = chunkWords + (SCALES[scaleIndex] ? " " + SCALES[scaleIndex] + " " : "") + words;
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }
  
  // Clean up extra spaces and return
  return words.trim();
}

export function formatAmountInWords(amount: number, currency: string): string {
  // Split into whole and decimal parts
  const wholePart = Math.floor(amount);
  const decimalPart = Math.round((amount - wholePart) * 100);
  
  const wholeWords = numberToWords(wholePart);
  const decimalWords = decimalPart > 0 ? numberToWords(decimalPart) : "";
  
  let result = wholeWords + " " + currency;
  if (decimalPart > 0) {
    result += " and " + decimalWords + " cents";
  }
  
  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}
