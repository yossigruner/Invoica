import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { InvoiceList } from "@/components/invoice/InvoiceList";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Card className="p-4 md:p-8 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Invoices</h1>
                <p className="text-gray-500">Manage your invoices</p>
              </div>
              <Link to="/invoices/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
            </div>

            <InvoiceList />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
