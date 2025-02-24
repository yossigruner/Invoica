import { format } from "date-fns";
import { ProfileData } from "../types/invoice";
import { logger } from "@/utils/logger";

interface InvoicePreviewHeaderProps {
  logo: string | null;
  invoiceNumber: string;
  profileData: ProfileData | null;
  issueDate: string;
  dueDate: string;
  currency: string;
}

export const InvoicePreviewHeader = ({
  logo,
  invoiceNumber,
  profileData,
  issueDate,
  dueDate,
  currency
}: InvoicePreviewHeaderProps) => {
  logger.info('Rendering invoice preview header', {
    hasLogo: !!logo,
    logoValue: logo
  });

  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        {logo && (
          <img 
            src={logo} 
            alt="Company Logo" 
            className="h-16 object-contain mb-4"
          />
        )}
        <h1 className="text-2xl font-bold">Invoice #{invoiceNumber || '______'}</h1>
        {profileData && (
          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium text-gray-900">{profileData.name}</p>
            <p>{profileData.address}</p>
            <p>{profileData.city}, {profileData.zip}</p>
            <p>{profileData.country}</p>
          </div>
        )}
      </div>
      <div className="text-right space-y-1">
        <div className="space-x-2">
          <span className="text-sm text-gray-500">Issue date:</span>
          <span className="text-sm">
            {issueDate ? format(new Date(issueDate), "PPP") : 'Select date'}
          </span>
        </div>
        <div className="space-x-2">
          <span className="text-sm text-gray-500">Due date:</span>
          <span className="text-sm">
            {dueDate ? format(new Date(dueDate), "PPP") : 'Select date'}
          </span>
        </div>
      </div>
    </div>
  );
};
