import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { useState, useEffect } from "react";
import { SignatureDialog } from "@/components/signature/SignatureDialog";
import { useNavigate } from "react-router-dom";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import { logger } from '@/utils/logger';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loading } from "@/components/ui/loading";
import { Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { Profile } from '@/types/profile';

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
] as const;

type CurrencyCode = typeof CURRENCY_OPTIONS[number]['value'];

const defaultFormState: Profile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companyName: '',
  companyAddress: '',
  companyCity: '',
  companyZip: '',
  companyCountry: '',
  companyPhone: '',
  companyEmail: '',
  companyWebsite: '',
  companyRegistration: '',
  companyVat: '',
  companyLogo: '',
  signature: '',
  bankName: '',
  accountName: '',
  accountNumber: '',
  swiftCode: '',
  iban: '',
  preferredCurrency: 'USD',
  isProfileCompleted: false,
  cloverApiKey: '',
  cloverMerchantId: '',
};

const Profile = () => {
  const navigate = useNavigate();
  const { profile, isLoading, error, updateProfile, isUpdating } = useProfile();
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [formData, setFormData] = useState<Profile>(defaultFormState);

  useEffect(() => {
    if (profile) {
      setFormData({
        ...defaultFormState,
        ...profile,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        companyName: profile.companyName || '',
        companyAddress: profile.companyAddress || '',
        companyCity: profile.companyCity || '',
        companyZip: profile.companyZip || '',
        companyCountry: profile.companyCountry || '',
        companyPhone: profile.companyPhone || '',
        companyEmail: profile.companyEmail || '',
        companyWebsite: profile.companyWebsite || '',
        companyRegistration: profile.companyRegistration || '',
        companyVat: profile.companyVat || '',
        companyLogo: profile.companyLogo || '',
        signature: profile.signature || '',
        bankName: profile.bankName || '',
        accountName: profile.accountName || '',
        accountNumber: profile.accountNumber || '',
        swiftCode: profile.swiftCode || '',
        iban: profile.iban || '',
        preferredCurrency: profile.preferredCurrency || 'USD',
        cloverApiKey: profile.cloverApiKey || '',
        cloverMerchantId: profile.cloverMerchantId || '',
        isProfileCompleted: profile.isProfileCompleted || false,
      });
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          companyLogo: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureSave = (signature: string) => {
    setFormData(prev => ({
      ...prev,
      signature,
    }));
    setSignatureOpen(false);
  };

  const handleSignatureRemove = () => {
    setFormData(prev => ({
      ...prev,
      signature: '',
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logger.info('Updating profile');

    try {
      // Start with required fields
      const profileData: any = {
        email: formData.email,
      };

      // Add optional fields with camelCase keys
      const optionalFields: any = {
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        phone: formData.phone || undefined,
        companyName: formData.companyName || undefined,
        companyAddress: formData.companyAddress || undefined,
        companyCity: formData.companyCity || undefined,
        companyZip: formData.companyZip || undefined,
        companyCountry: formData.companyCountry || undefined,
        companyPhone: formData.companyPhone || undefined,
        companyEmail: formData.companyEmail || undefined,
        companyWebsite: formData.companyWebsite || undefined,
        companyRegistration: formData.companyRegistration || undefined,
        companyVat: formData.companyVat || undefined,
        companyLogo: formData.companyLogo || undefined,
        signature: formData.signature || undefined,
        bankName: formData.bankName || undefined,
        accountName: formData.accountName || undefined,
        accountNumber: formData.accountNumber || undefined,
        swiftCode: formData.swiftCode || undefined,
        iban: formData.iban || undefined,
        preferredCurrency: formData.preferredCurrency || undefined,
        cloverApiKey: formData.cloverApiKey || undefined,
        cloverMerchantId: formData.cloverMerchantId || undefined,
        isProfileCompleted: true
      };

      // Remove empty strings
      Object.keys(optionalFields).forEach(key => {
        const value = optionalFields[key];
        if (value === '') {
          delete optionalFields[key];
        }
      });

      // Merge required and optional fields
      const finalProfileData = { ...profileData, ...optionalFields };

      await updateProfile(finalProfileData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      logger.error('Failed to update profile', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  if (isLoading || isUpdating) {
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }

  if (error) {
  return (
    <div className="min-h-screen bg-background">
        
      <div className="container mx-auto px-4 pt-20 pb-12">
        <Card className="max-w-2xl mx-auto p-6">
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="text-lg text-red-500">Failed to load profile</div>
              <Button onClick={() => { navigate(0); }}>Retry</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto p-8 shadow-xl bg-white/90 backdrop-blur-sm border-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-300 via-primary-500 to-primary-700" />
          
          <div className="text-center mb-10 relative">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-gray-500 mt-2">Manage your personal and business information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Personal Information Section */}
            <div className="space-y-6 rounded-lg bg-gray-50/50 p-6 transition-all hover:bg-white hover:shadow-md">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <Label htmlFor="firstName" className="text-gray-700 group-hover:text-primary-600 transition-colors">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="lastName" className="text-gray-700 group-hover:text-primary-600 transition-colors">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="email" className="text-gray-700 group-hover:text-primary-600 transition-colors">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="phone" className="text-gray-700 group-hover:text-primary-600 transition-colors">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Company Information Section */}
            <div className="space-y-6 rounded-lg bg-gray-50/50 p-6 transition-all hover:bg-white hover:shadow-md">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Company Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2 group">
                  <Label htmlFor="companyName" className="text-gray-700 group-hover:text-primary-600 transition-colors">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-2 md:col-span-2 group">
                  <Label htmlFor="companyAddress" className="text-gray-700 group-hover:text-primary-600 transition-colors">Company Address</Label>
                  <Input
                    id="companyAddress"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    placeholder="Enter company address"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="companyCity" className="text-gray-700 group-hover:text-primary-600 transition-colors">City</Label>
                  <Input
                    id="companyCity"
                    name="companyCity"
                    value={formData.companyCity}
                    onChange={handleInputChange}
                    placeholder="Enter company city"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="companyZip" className="text-gray-700 group-hover:text-primary-600 transition-colors">ZIP Code</Label>
                  <Input
                    id="companyZip"
                    name="companyZip"
                    value={formData.companyZip}
                    onChange={handleInputChange}
                    placeholder="Enter company ZIP code"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="companyCountry" className="text-gray-700 group-hover:text-primary-600 transition-colors">Country</Label>
                  <Input
                    id="companyCountry"
                    name="companyCountry"
                    value={formData.companyCountry}
                    onChange={handleInputChange}
                    placeholder="Enter company country"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="companyPhone" className="text-gray-700 group-hover:text-primary-600 transition-colors">Phone</Label>
                  <Input
                    id="companyPhone"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleInputChange}
                    placeholder="Enter company phone"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="companyEmail" className="text-gray-700 group-hover:text-primary-600 transition-colors">Email</Label>
                  <Input
                    id="companyEmail"
                    name="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={handleInputChange}
                    placeholder="Enter company email"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="companyWebsite" className="text-gray-700 group-hover:text-primary-600 transition-colors">Website</Label>
                  <Input
                    id="companyWebsite"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                    placeholder="Enter company website"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="companyRegistration" className="text-gray-700 group-hover:text-primary-600 transition-colors">Registration Number</Label>
                  <Input
                    id="companyRegistration"
                    name="companyRegistration"
                    value={formData.companyRegistration}
                    onChange={handleInputChange}
                    placeholder="Enter registration number"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="companyVat" className="text-gray-700 group-hover:text-primary-600 transition-colors">VAT Number</Label>
                  <Input
                    id="companyVat"
                    name="companyVat"
                    value={formData.companyVat}
                    onChange={handleInputChange}
                    placeholder="Enter VAT number"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="preferredCurrency" className="text-gray-700">Preferred Currency</Label>
                  <Select
                    value={formData.preferredCurrency}
                    onValueChange={(value: CurrencyCode) => {
                      setFormData(prev => ({
                        ...prev,
                        preferredCurrency: value
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full h-11 border-gray-200 hover:border-primary-300 transition-colors">
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200">
                      {CURRENCY_OPTIONS.map((currency) => (
                        <SelectItem 
                          key={currency.value} 
                          value={currency.value}
                          className="hover:bg-primary-50 cursor-pointer transition-colors"
                        >
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2 group">
                  <Label className="text-gray-700">Company Logo</Label>
                  <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                  <div
                    onClick={() => { 
                      const logoInput = document.getElementById("logo-upload");
                      if (logoInput) {
                        logoInput.click();
                      }
                    }}
                    className="mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all hover:border-primary-400 hover:bg-primary-50/50 group"
                  >
                    {formData.companyLogo ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <img src={formData.companyLogo} alt="Company Logo" className="max-h-32 object-contain rounded-lg shadow-sm" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                        </div>
                        <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">Click to change logo</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                          📷
                        </div>
                        <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">Click to upload logo</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2 group">
                  <Label className="text-gray-700">Signature</Label>
                  <div
                    onClick={() => { setSignatureOpen(true); }}
                    className="mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all hover:border-primary-400 hover:bg-primary-50/50 group"
                  >
                    {formData.signature ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <img src={formData.signature} alt="Signature" className="max-h-24 object-contain rounded-lg shadow-sm" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                        </div>
                        <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">Click to change signature</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                          ✍️
                        </div>
                        <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">Click to add signature</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Banking Information Section */}
            <div className="space-y-6 rounded-lg bg-gray-50/50 p-6 transition-all hover:bg-white hover:shadow-md">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Banking Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <Label htmlFor="bankName" className="text-gray-700 group-hover:text-primary-600 transition-colors">Bank Name</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="Enter your bank name"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="accountName" className="text-gray-700 group-hover:text-primary-600 transition-colors">Account Name</Label>
                  <Input
                    id="accountName"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleInputChange}
                    placeholder="Enter account name"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="accountNumber" className="text-gray-700 group-hover:text-primary-600 transition-colors">Account Number</Label>
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="swiftCode" className="text-gray-700 group-hover:text-primary-600 transition-colors">SWIFT/BIC Code</Label>
                  <Input
                    id="swiftCode"
                    name="swiftCode"
                    value={formData.swiftCode}
                    onChange={handleInputChange}
                    placeholder="Enter SWIFT/BIC code"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="iban" className="text-gray-700 group-hover:text-primary-600 transition-colors">IBAN</Label>
                  <Input
                    id="iban"
                    name="iban"
                    value={formData.iban}
                    onChange={handleInputChange}
                    placeholder="Enter IBAN"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Payment Integration Section */}
            <div className="space-y-6 rounded-lg bg-gray-50/50 p-6 transition-all hover:bg-white hover:shadow-md">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Payment Integration</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <Label htmlFor="cloverApiKey" className="text-gray-700 group-hover:text-primary-600 transition-colors">Clover API Key</Label>
                  <div className="relative">
                    <Input
                      id="cloverApiKey"
                      name="cloverApiKey"
                      type={showApiKey ? "text" : "password"}
                      value={formData.cloverApiKey || ''}
                      onChange={handleInputChange}
                      placeholder="Enter your Clover API key"
                      autoComplete="new-password"
                      className="h-11 pr-10 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="cloverMerchantId" className="text-gray-700 group-hover:text-primary-600 transition-colors">Clover Merchant ID</Label>
                  <Input
                    id="cloverMerchantId"
                    name="cloverMerchantId"
                    value={formData.cloverMerchantId || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your Clover merchant ID"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-100">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <p className="text-primary-900 font-medium">Secure Payment Processing</p>
                    <p className="text-primary-700 mt-1">
                      Your Clover credentials are encrypted before storage and are only used for processing credit card payments.
                      Make sure to keep these credentials secure and never share them with anyone.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-11 px-8 text-base font-medium transition-all hover:bg-primary-600 hover:scale-105 active:scale-100 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Spinner />
                    Saving...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
          </div>
          </form>
        </Card>
      </div>
      
      <SignatureDialog 
        open={signatureOpen}
        onClose={() => { setSignatureOpen(false); }}
        onSave={handleSignatureSave}
      />
    </div>
  );
};

export default Profile;
