import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
import SignaturePad from "react-signature-canvas";
import { toast } from "sonner";

interface SignatureDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
}

const SIGNATURE_FONTS = [
  { name: 'Signature 1', font: 'Dancing Script', class: 'font-["Dancing_Script"]' },
  { name: 'Signature 2', font: 'Great Vibes', class: 'font-["Great_Vibes"]' },
  { name: 'Signature 3', font: 'Pacifico', class: 'font-["Pacifico"]' },
  { name: 'Signature 4', font: 'Alex Brush', class: 'font-["Alex_Brush"]' },
];

export const SignatureDialog = ({ open, onClose, onSave }: SignatureDialogProps) => {
  const [activeTab, setActiveTab] = useState('draw');
  const [name, setName] = useState('');
  const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0]);
  const signaturePadRef = useRef<SignaturePad>(null);

  // Load fonts
  useEffect(() => {
    const loadFonts = async () => {
      await Promise.all([
        import('@fontsource/dancing-script'),
        import('@fontsource/great-vibes'),
        import('@fontsource/pacifico'),
        import('@fontsource/alex-brush'),
      ]);
    };
    loadFonts();
  }, []);

  const handleSave = () => {
    let signatureData = '';

    if (activeTab === 'draw' && signaturePadRef.current) {
      if (signaturePadRef.current.isEmpty()) {
        toast.error('Please draw your signature');
        return;
      }
      signatureData = signaturePadRef.current.toDataURL();
    } else if (activeTab === 'type') {
      if (!name.trim()) {
        toast.error('Please enter your name');
        return;
      }
      // Create canvas to generate signature from text
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1a1a1a';
        ctx.font = `72px ${selectedFont.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, canvas.width / 2, canvas.height / 2);
        signatureData = canvas.toDataURL();
      }
    } else if (activeTab === 'upload') {
      if (!signatureData) {
        toast.error('Please upload a signature');
        return;
      }
    }

    onSave(signatureData);
    onClose();
    setName('');
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const handleClear = () => {
    if (activeTab === 'draw' && signaturePadRef.current) {
      signaturePadRef.current.clear();
    } else if (activeTab === 'type') {
      setName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Your Signature</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="draw" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Draw
            </TabsTrigger>
            <TabsTrigger value="type" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Type
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="mt-0">
            <div className="border rounded-lg p-4 bg-white">
              <SignaturePad
                ref={signaturePadRef}
                canvasProps={{
                  className: "w-full h-[200px] border rounded-lg bg-white",
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="type" className="mt-0 space-y-4">
            <div className="space-y-4">
              <Input
                placeholder="Type your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
              <div className="grid grid-cols-2 gap-3">
                {SIGNATURE_FONTS.map((font) => (
                  <div
                    key={font.name}
                    onClick={() => setSelectedFont(font)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary-500 ${
                      selectedFont.name === font.name ? 'border-primary-500 bg-primary-50' : ''
                    }`}
                  >
                    <p className="text-sm text-gray-600 mb-2">{font.name}</p>
                    <p className={`text-2xl ${font.class}`}>{name || 'Preview'}</p>
                  </div>
                ))}
              </div>
              <div className="border rounded-lg p-6 bg-white flex items-center justify-center">
                <p className={`text-4xl ${selectedFont.class} text-gray-800`}>
                  {name || 'Your Signature'}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-0">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="signature-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        onSave(event.target.result as string);
                        onClose();
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label
                htmlFor="signature-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center text-2xl">
                  📄
                </div>
                <div className="text-sm text-gray-600">
                  Click to upload your signature image
                </div>
              </label>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="px-6"
          >
            Clear
          </Button>
          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="px-6"
            >
              Save Signature
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
