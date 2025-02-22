import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Pen } from "lucide-react";
import { SignatureDialog } from "@/components/signature/SignatureDialog";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'United States Dollar (USD)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
] as const;

type CurrencyCode = typeof CURRENCY_OPTIONS[number]['value'];

const tabs = [
  { id: "personal", label: "Personal Info" },
  { id: "company", label: "Company Info" },
  { id: "banking", label: "Banking Info" },
];

const ProfileWizard = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, error: profileError, createProfile } = useProfile();
  const [currentTab, setCurrentTab] = useState("personal");
  const [signatureOpen, setSignatureOpen] = useState(false);
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
    preferred_currency: 'USD' as CurrencyCode
  });

  // Load existing profile data when component mounts
  useEffect(() => {
    if (profile) {
      logger.info('Loading existing profile data');
      setFormData(prev => ({
        ...prev,
        ...profile,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        company_logo: profile.company_logo || null,
        signature: profile.signature || null,
        preferred_currency: (profile.preferred_currency as CurrencyCode) || 'USD'
      }));
    }
  }, [profile]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSignatureSave = (signatureData: string) => {
    setFormData(prev => ({
      ...prev,
      signature: signatureData
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          company_logo: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logger.info('Submitting profile wizard data');

    try {
      const profileData = {
        ...formData,
        is_profile_completed: true
      };

      await createProfile(profileData);
      toast.success('Profile setup completed!');
      navigate('/');
    } catch (error) {
      logger.error('Failed to save profile data', error);
      toast.error('Failed to save profile data. Please try again.');
    }
  };

  const handleNext = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === currentTab);
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1].id);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl p-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-500">Loading profile data...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl p-8">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="text-lg text-red-500">Failed to load profile data</div>
            <Button onClick={() => navigate(0)}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-gray-500">Please fill in your information to get started</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid grid-cols-3 w-full">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="personal" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    placeholder="123 Street Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={handleInputChange('city')}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={handleInputChange('zip')}
                    placeholder="12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={handleInputChange('country')}
                    placeholder="Country"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="company" className="space-y-6 mt-6">
              <div className="space-y-4">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange('company_name')}
                  placeholder="Company Name"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="business_type">Business Type</Label>
                <Input
                  id="business_type"
                  value={formData.business_type}
                  onChange={handleInputChange('business_type')}
                  placeholder="Business Type"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="tax_number">Tax Number</Label>
                <Input
                  id="tax_number"
                  value={formData.tax_number}
                  onChange={handleInputChange('tax_number')}
                  placeholder="Tax Number"
                />
              </div>

              <div className="space-y-4">
                <Label>Company Logo</Label>
                <input
                  type="file"
                  id="logo"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                <div
                  onClick={() => document.getElementById("logo")?.click()}
                  className="mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {formData.company_logo ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={formData.company_logo}
                        alt="Company Logo"
                        className="max-h-32 object-contain"
                      />
                      <span className="text-sm text-gray-600">
                        Click to change logo
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Image className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Click to upload logo
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Signature</Label>
                <div
                  onClick={() => setSignatureOpen(true)}
                  className="mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {formData.signature ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={formData.signature}
                        alt="Signature"
                        className="max-h-20"
                      />
                      <span className="text-sm text-gray-600">
                        Click to change signature
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Pen className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Click to add signature
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="banking" className="space-y-6 mt-6">
              <div className="space-y-4">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={handleInputChange('bank_name')}
                  placeholder="Bank Name"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  value={formData.account_name}
                  onChange={handleInputChange('account_name')}
                  placeholder="Account Name"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange('account_number')}
                  placeholder="Account Number"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="swift_code">SWIFT/BIC Code</Label>
                <Input
                  id="swift_code"
                  value={formData.swift_code}
                  onChange={handleInputChange('swift_code')}
                  placeholder="SWIFT/BIC Code"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={handleInputChange('iban')}
                  placeholder="IBAN"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="preferred_currency">Preferred Currency</Label>
                <Select
                  value={formData.preferred_currency}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    preferred_currency: value as CurrencyCode
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentTab === tabs[0].id}
            >
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  toast.info('You can complete your profile later from the Profile page');
                  navigate('/');
                }}
              >
                Skip for Now
              </Button>
              {currentTab === tabs[tabs.length - 1].id ? (
                <Button type="submit" disabled={profileLoading}>
                  {profileLoading ? "Saving..." : "Complete Setup"}
                </Button>
              ) : (
                <Button type="button" onClick={handleNext}>
                  Next Step
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>

      <SignatureDialog
        open={signatureOpen}
        onClose={() => setSignatureOpen(false)}
        onSave={handleSignatureSave}
      />
    </div>
  );
};

export default ProfileWizard;
