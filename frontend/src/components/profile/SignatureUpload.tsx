
import { Pen } from "lucide-react";
import { Label } from "@/components/ui/label";

interface SignatureUploadProps {
  signature: string | null;
  onSignatureClick: () => void;
}

export const SignatureUpload = ({ signature, onSignatureClick }: SignatureUploadProps) => {
  return (
    <div className="space-y-4">
      <Label>Signature:</Label>
      <div 
        className="mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onSignatureClick}
      >
        {signature ? (
          <div className="flex flex-col items-center gap-2">
            <img src={signature} alt="Signature" className="max-h-20" />
            <span className="text-sm text-gray-600">Click to change signature</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Pen className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">Click to add signature</span>
            <span className="text-xs text-gray-500">This signature will appear on your invoices</span>
          </div>
        )}
      </div>
    </div>
  );
};
