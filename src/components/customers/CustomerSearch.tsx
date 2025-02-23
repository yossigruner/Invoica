
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CustomerSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const CustomerSearch = ({ value, onChange }: CustomerSearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search customers..."
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        className="pl-10 bg-white/50 focus:bg-white transition-colors"
      />
    </div>
  );
};
