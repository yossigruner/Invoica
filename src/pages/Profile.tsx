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

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'United States Dollar (USD)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
] as const;

type CurrencyCode = typeof CURRENCY_OPTIONS[number]['value'];

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  company_name: string;
  company_logo?: string;
  signature?: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  swift_code: string;
  iban: string;
  preferred_currency: string;
  business_type: string;
  tax_number: string;
  clover_api_key: string;
  clover_merchant_id: string;
  is_profile_completed: boolean;
}

const Profile = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, error: profileError, updateProfile } = useProfile();
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    country: '',
    company_name: '',
    company_logo: null as string | null,
    signature: null as string | null,
    business_type: '',
    tax_number: '',
    bank_name: '',
    account_name: '',
    account_number: '',
    swift_code: '',
    iban: '',
    preferred_currency: 'USD',
    clover_api_key: '',
    clover_merchant_id: '',
  });

  // Load profile data when component mounts
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        ...profile,
        company_logo: profile.company_logo || null,
        signature: profile.signature || null
      }));
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignatureSave = (signatureData: string) => {
    setFormData(prev => ({
      ...prev,
      signature: signatureData
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const target = e.target;
        if (target && target.result) {
          const result = target.result as string;
          setFormData(prev => ({
            ...prev,
            company_logo: result
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logger.info('Updating profile');

    try {
      const profileData: Partial<Profile> = {
        is_profile_completed: true,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zip: formData.zip,
        country: formData.country,
        company_name: formData.company_name,
        company_logo: formData.company_logo || undefined,
        bank_name: formData.bank_name,
        account_name: formData.account_name,
        account_number: formData.account_number,
        swift_code: formData.swift_code,
        iban: formData.iban,
        preferred_currency: formData.preferred_currency,
        clover_api_key: formData.clover_api_key,
        clover_merchant_id: formData.clover_merchant_id,
      };

      await updateProfile(profileData);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      logger.error('Failed to update profile', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleRemoveLogo = () => {
    const logoElement = document.querySelector('#company-logo') as HTMLImageElement;
    if (logoElement) {
      logoElement.src = '';
    }
    setFormData((prev) => ({
      ...prev,
      company_logo: null,
    }));
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <Loading message="Loading profile..." />
        </div>
      </div>
    );
  }

  if (profileError) {
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
                  <Label htmlFor="first_name" className="text-gray-700 group-hover:text-primary-600 transition-colors">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="last_name" className="text-gray-700 group-hover:text-primary-600 transition-colors">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="email" className="text-gray-700 group-hover:text-primary-600 transition-colors">Email Address</Label>
                  <Input
                    id="email"
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
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 md:col-span-2 group">
                  <Label htmlFor="address" className="text-gray-700 group-hover:text-primary-600 transition-colors">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your street address"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="city" className="text-gray-700 group-hover:text-primary-600 transition-colors">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="country" className="text-gray-700 group-hover:text-primary-600 transition-colors">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Enter your country"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="zip" className="text-gray-700 group-hover:text-primary-600 transition-colors">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    placeholder="Enter your ZIP code"
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
                  <Label htmlFor="company_name" className="text-gray-700 group-hover:text-primary-600 transition-colors">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    placeholder="Enter your company name"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="business_type" className="text-gray-700 group-hover:text-primary-600 transition-colors">Business Type</Label>
                  <Input
                    id="business_type"
                    value={formData.business_type}
                    onChange={handleInputChange}
                    placeholder="Enter your business type"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="tax_number" className="text-gray-700 group-hover:text-primary-600 transition-colors">Tax Number</Label>
                  <Input
                    id="tax_number"
                    value={formData.tax_number}
                    onChange={handleInputChange}
                    placeholder="Enter your tax number"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>

                <div className="space-y-2 md:col-span-2 group">
                  <Label className="text-gray-700">Company Logo</Label>
                  <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  <div
                    onClick={() => { 
                      const logoInput = document.getElementById("logo-upload");
                      if (logoInput) {
                        logoInput.click();
                      }
                    }}
                    className="mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all hover:border-primary-400 hover:bg-primary-50/50 group"
                  >
                    {formData.company_logo ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <img src={formData.company_logo} alt="Company Logo" className="max-h-32 object-contain rounded-lg shadow-sm" />
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
                  <Label htmlFor="bank_name" className="text-gray-700 group-hover:text-primary-600 transition-colors">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    placeholder="Enter your bank name"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="account_name" className="text-gray-700 group-hover:text-primary-600 transition-colors">Account Name</Label>
                  <Input
                    id="account_name"
                    value={formData.account_name}
                    onChange={handleInputChange}
                    placeholder="Enter account name"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="account_number" className="text-gray-700 group-hover:text-primary-600 transition-colors">Account Number</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="swift_code" className="text-gray-700 group-hover:text-primary-600 transition-colors">SWIFT/BIC Code</Label>
                  <Input
                    id="swift_code"
                    value={formData.swift_code}
                    onChange={handleInputChange}
                    placeholder="Enter SWIFT/BIC code"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="iban" className="text-gray-700 group-hover:text-primary-600 transition-colors">IBAN</Label>
                  <Input
                    id="iban"
                    value={formData.iban}
                    onChange={handleInputChange}
                    placeholder="Enter IBAN"
                    className="h-11 transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_currency" className="text-gray-700">Preferred Currency</Label>
                  <Select
                    value={formData.preferred_currency}
                    onValueChange={(value: CurrencyCode) => {
                      setFormData(prev => ({
                        ...prev,
                        preferred_currency: value
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
                  <Label htmlFor="clover_api_key" className="text-gray-700 group-hover:text-primary-600 transition-colors">
                    Clover API Key
                    <span className="ml-1 text-xs text-gray-500">(Securely Stored)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="clover_api_key"
                      type={showApiKey ? "text" : "password"}
                      name="clover_api_key"
                      value={formData.clover_api_key || ''}
                      onChange={handleInputChange}
                      placeholder="Enter your Clover API key"
                      className="h-11 font-mono transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-11 w-11 px-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Your private API key from Clover dashboard</p>
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="clover_merchant_id" className="text-gray-700 group-hover:text-primary-600 transition-colors">
                    Clover Merchant ID
                  </Label>
                  <Input
                    id="clover_merchant_id"
                    name="clover_merchant_id"
                    value={formData.clover_merchant_id || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your Clover Merchant ID"
                    className="h-11 font-mono uppercase transition-all border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                  />
                  <p className="text-xs text-gray-500">Your Merchant ID from Clover dashboard</p>
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
                disabled={profileLoading}
                className="h-11 px-8 text-base font-medium transition-all hover:bg-primary-600 hover:scale-105 active:scale-100 disabled:opacity-50 disabled:hover:scale-100"
              >
                {profileLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
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
