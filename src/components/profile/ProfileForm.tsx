import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileData } from "@/components/invoice/types/invoice";
import { validateCloverCredentials, encryptCloverCredentials, isValidApiKey, isValidMerchantId } from "@/utils/cloverUtils";
import { CreditCard, Store, AlertCircle } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { logger } from "@/utils/logger";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface ProfileFormProps {
  profile: ProfileData;
  onSubmit: (values: ProfileData) => Promise<void>;
}

export const ProfileForm = ({ profile, onSubmit }: ProfileFormProps) => {
  const { user } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const form = useForm<ProfileData>({
    defaultValues: profile,
    mode: "onChange"
  });

  const handleSubmit = async (values: ProfileData) => {
    try {
      setIsValidating(true);

      // Create a copy of values to modify
      const updatedValues = { ...values };

      // Validate Clover credentials if provided
      if (updatedValues.clover_api_key && updatedValues.clover_merchant_id) {
        // Format validation
        if (!isValidApiKey(updatedValues.clover_api_key)) {
          toast.error("Invalid API key format");
          return;
        }

        if (!isValidMerchantId(updatedValues.clover_merchant_id)) {
          toast.error("Invalid Merchant ID format");
          return;
        }

        // API validation
        const isValid = await validateCloverCredentials(
          updatedValues.clover_api_key,
          updatedValues.clover_merchant_id
        );

        if (!isValid) {
          toast.error("Invalid Clover credentials. Please check and try again.");
          return;
        }

        // Encrypt API key before storing
        if (user) {
          try {
            updatedValues.clover_api_key = await encryptCloverCredentials(
              updatedValues.clover_api_key,
              user.id
            );
          } catch (error) {
            logger.error('Failed to encrypt Clover API key', error);
            toast.error("Failed to secure credentials");
            return;
          }
        }
      }

      await onSubmit(updatedValues);
      toast.success("Profile updated successfully");
    } catch (error) {
      logger.error('Failed to update profile', error);
      toast.error("Failed to update profile");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid gap-2">
          <Label htmlFor="name">Name:</Label>
          <Input 
            id="name" 
            placeholder="Your name" 
            value={profile.name}
            onChange={(e) => form.setValue('name', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="address">Address:</Label>
          <Input 
            id="address" 
            placeholder="Your address" 
            value={profile.address}
            onChange={(e) => form.setValue('address', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="zip">ZIP:</Label>
            <Input 
              id="zip" 
              placeholder="Your ZIP code" 
              value={profile.zip}
              onChange={(e) => form.setValue('zip', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">City:</Label>
            <Input 
              id="city" 
              placeholder="Your city" 
              value={profile.city}
              onChange={(e) => form.setValue('city', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="country">Country:</Label>
          <Input 
            id="country" 
            placeholder="Your country" 
            value={profile.country}
            onChange={(e) => form.setValue('country', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email:</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Your email" 
            value={profile.email}
            onChange={(e) => form.setValue('email', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">Phone:</Label>
          <Input 
            id="phone" 
            placeholder="Your phone number" 
            value={profile.phone}
            onChange={(e) => form.setValue('phone', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="bankName">Bank Name:</Label>
          <Input 
            id="bankName" 
            placeholder="Your bank name" 
            value={profile.bankName || ''}
            onChange={(e) => form.setValue('bankName', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="accountName">Account Name:</Label>
          <Input 
            id="accountName" 
            placeholder="Your account name" 
            value={profile.accountName || ''}
            onChange={(e) => form.setValue('accountName', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="accountNumber">Account Number:</Label>
          <Input 
            id="accountNumber" 
            placeholder="Your account number" 
            value={profile.accountNumber || ''}
            onChange={(e) => form.setValue('accountNumber', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="swiftCode">Swift Code:</Label>
          <Input 
            id="swiftCode" 
            placeholder="Your SWIFT/BIC code" 
            value={profile.swiftCode || ''}
            onChange={(e) => form.setValue('swiftCode', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="iban">IBAN:</Label>
          <Input 
            id="iban" 
            placeholder="Your IBAN" 
            value={profile.iban || ''}
            onChange={(e) => form.setValue('iban', e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Payment Integration</h3>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your Clover credentials are encrypted before storage and can only be accessed by you.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="clover_api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clover API Key</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your Clover API key"
                      {...field}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Your private API key from Clover dashboard
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clover_merchant_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clover Merchant ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your Clover Merchant ID"
                      {...field}
                      className="font-mono uppercase"
                    />
                  </FormControl>
                  <FormDescription>
                    Your Merchant ID from Clover dashboard
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="h-4 w-4" />
            <span>
              These credentials will be securely stored and used for processing credit card payments
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isValidating}
          className="w-full px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isValidating ? "Validating Credentials..." : "Save Profile"}
        </button>
      </form>
    </Form>
  );
};
