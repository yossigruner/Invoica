
interface BillingInfo {
  name: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  email: string;
  phone: string;
}

interface InvoiceBillingInfoProps {
  billingInfo: BillingInfo;
}

export const InvoiceBillingInfo = ({ billingInfo }: InvoiceBillingInfoProps) => {
  return (
    <div>
      <h2 className="font-semibold mb-2">Bill to:</h2>
      <div className="space-y-1">
        <p className="text-gray-900">{billingInfo.name || 'Customer Name'}</p>
        <p className="text-gray-600">{billingInfo.address || 'Customer Address'}</p>
        <p className="text-gray-600">
          {[billingInfo.city, billingInfo.zip, billingInfo.country]
            .filter(Boolean)
            .join(', ') || 'City, ZIP, Country'}
        </p>
        <p className="text-gray-600">{billingInfo.email || 'customer@email.com'}</p>
        <p className="text-gray-600">{billingInfo.phone || '+1 234 567 890'}</p>
      </div>
    </div>
  );
};
