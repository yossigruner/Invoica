export interface Profile {
  id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  companyName?: string;
  companyLogo?: string;
  signature?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  swiftCode?: string;
  iban?: string;
  preferredCurrency?: string;
  isProfileCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  cloverApiKey?: string;
  cloverMerchantId?: string;
} 