import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

interface CustomerPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  totalItems?: number;
}

export const CustomerPagination = ({ 
  currentPage, 
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalItems = 0
}: CustomerPaginationProps) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-2">
        No items to display
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
      <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
        <span className="text-sm text-gray-600 whitespace-nowrap">Items per page:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => { onPageSizeChange(Number(value)); }}
          aria-label="Select number of items per page"
        >
          <SelectTrigger className="w-[100px] h-9 bg-white/50 hover:bg-white transition-colors border-gray-200 hover:border-primary focus:ring-primary">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem 
                key={size} 
                value={size.toString()}
                className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer transition-colors"
              >
                <span className="font-medium">{size}</span> items
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 justify-center w-full sm:w-auto">
        <div className="text-sm text-gray-600 hidden sm:block">
          Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{totalItems}</span> items
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { onPageChange(Math.max(1, currentPage - 1)); }}
            disabled={currentPage === 1}
            className="h-9 px-3 hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-2">Previous</span>
          </Button>
          <div className="flex items-center min-w-[100px] justify-center text-sm bg-white/50 rounded-md border border-gray-200 px-3 h-9">
            <span className="text-gray-600">
              Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { onPageChange(Math.min(totalPages, currentPage + 1)); }}
            disabled={currentPage === totalPages}
            className="h-9 px-3 hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
            aria-label="Next page"
          >
            <span className="sr-only sm:not-sr-only sm:mr-2">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
