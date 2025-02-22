import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Users, Info, HelpCircle, Mail, Menu } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { supabase } from "@/db/config";

export const Navbar = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="relative bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold">I</span>
              </div>
              <span className="font-semibold text-xl bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                Invoica
              </span>
            </Link>
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/">
                  <Button variant="ghost" className="gap-2 hover:bg-primary/10 hover:text-primary">
                    <FileText className="h-4 w-4" />
                    Invoices
                  </Button>
                </Link>
                <Link to="/customers">
                  <Button variant="ghost" className="gap-2 hover:bg-primary/10 hover:text-primary">
                    <Users className="h-4 w-4" />
                    Customers
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/about">
              <Button variant="ghost" className="gap-2 hover:bg-primary/10 hover:text-primary">
                <Info className="h-4 w-4" />
                About
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" className="gap-2 hover:bg-primary/10 hover:text-primary">
                <Mail className="h-4 w-4" />
                Contact
              </Button>
            </Link>
            <Link to="/faq">
              <Button variant="ghost" className="gap-2 hover:bg-primary/10 hover:text-primary">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </Button>
            </Link>
            {isAuthenticated && <UserAvatar />}
          </div>

          <div className="md:hidden flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  {isAuthenticated && (
                    <>
                      <Link to="/">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <FileText className="h-4 w-4" />
                          Invoices
                        </Button>
                      </Link>
                      <Link to="/customers">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <Users className="h-4 w-4" />
                          Customers
                        </Button>
                      </Link>
                    </>
                  )}
                  <Link to="/about">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Info className="h-4 w-4" />
                      About
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Mail className="h-4 w-4" />
                      Contact
                    </Button>
                  </Link>
                  <Link to="/faq">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <HelpCircle className="h-4 w-4" />
                      FAQ
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
            {isAuthenticated && <UserAvatar />}
          </div>
        </div>
      </div>
    </nav>
  );
};
