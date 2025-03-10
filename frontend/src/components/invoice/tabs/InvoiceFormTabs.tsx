import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs";
import { FileText, User, ListChecks, CreditCard, ClipboardList, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type TabType = "from" | "details" | "items" | "payment" | "summary";

interface InvoiceFormTabsProps {
  currentTab: TabType;
  completedTabs?: TabType[];
  onTabChange?: (value: string) => void;
  children?: ReactNode;
}

export const InvoiceFormTabs = ({ currentTab, completedTabs = [], onTabChange, children }: InvoiceFormTabsProps) => {
  const getTabIcon = (tab: TabType, isCompleted: boolean) => {
    if (isCompleted) {
      return <Check className="h-4 w-4 text-green-500" />;
    }

    switch (tab) {
      case "from":
        return <User className="h-4 w-4" />;
      case "details":
        return <FileText className="h-4 w-4" />;
      case "items":
        return <ListChecks className="h-4 w-4" />;
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      case "summary":
        return <ClipboardList className="h-4 w-4" />;
    }
  };

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case "from":
        return "Customer Info";
      case "details":
        return "Invoice Details";
      case "items":
        return "Line Items";
      case "payment":
        return "Payment Info";
      case "summary":
        return "Summary";
    }
  };

  return (
    <Tabs value={currentTab} onValueChange={onTabChange}>
      <TabsList className="w-full mb-6 inline-flex h-auto p-1 bg-muted/50 rounded-lg">
        {["from", "details", "items", "payment", "summary"].map((tab) => {
          const isCompleted = completedTabs.includes(tab as TabType);
          return (
            <TabsTrigger
              key={tab}
              value={tab}
              className={cn(
                "flex-1 min-w-[40px] sm:min-w-[80px] transition-all py-2 sm:py-3",
                "data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm",
                "hover:bg-white/50",
                isCompleted && "text-green-600"
              )}
            >
              <div className="flex flex-col items-center gap-1">
                {getTabIcon(tab as TabType, isCompleted)}
                <span className="text-xs font-medium hidden sm:block">
                  {getTabLabel(tab as TabType)}
                </span>
              </div>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {children}
    </Tabs>
  );
};
