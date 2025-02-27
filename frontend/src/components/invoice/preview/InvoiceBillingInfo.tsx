interface BillingInfo {
  name: string;
  address: string;
  zip: string;
  city: string;
  province: string;
  country: string;
  email: string;
  phone: string;
}

interface InvoiceBillingInfoProps {
  billingInfo: BillingInfo;
}

export const InvoiceBillingInfo = ({ billingInfo }: InvoiceBillingInfoProps) => {
  return (
    <div className="text-sm space-y-1">
      <p>{billingInfo.name}</p>
      <p>{billingInfo.address}</p>
      <p>
        {billingInfo.city}
        {billingInfo.province && `, ${billingInfo.province}`}
        {billingInfo.zip && ` ${billingInfo.zip}`}
      </p>
      <p>{billingInfo.country}</p>
      <p>{billingInfo.email}</p>
      {billingInfo.phone && <p>{billingInfo.phone}</p>}
    </div>
  );
}; 