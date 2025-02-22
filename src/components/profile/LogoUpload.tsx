
import { Image } from "lucide-react";
import { Label } from "@/components/ui/label";

interface LogoUploadProps {
  logo: string | null;
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  logoInputRef: React.RefObject<HTMLInputElement>;
}

export const LogoUpload = ({ logo, onLogoUpload, logoInputRef }: LogoUploadProps) => {
  return (
    <div className="space-y-4">
      <Label>Company Logo:</Label>
      <input
        type="file"
        ref={logoInputRef}
        className="hidden"
        accept="image/*"
        onChange={onLogoUpload}
      />
      <div 
        className="mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => logoInputRef.current?.click()}
      >
        {logo ? (
          <div className="flex flex-col items-center gap-2">
            <img src={logo} alt="Company Logo" className="max-h-32 object-contain" />
            <span className="text-sm text-gray-600">Click to change logo</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Image className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">Click to upload logo</span>
            <span className="text-xs text-gray-500">This logo will appear on your invoices</span>
          </div>
        )}
      </div>
    </div>
  );
};
