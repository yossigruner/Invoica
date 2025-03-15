import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "./UserAvatar";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const NavLinks = () => (
    <>
      {isAuthenticated && (
        <>
          <Link
            to="/"
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              isActiveRoute("/")
                ? "bg-primary/10 text-primary"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Invoices
          </Link>
          <Link
            to="/customers"
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              isActiveRoute("/customers")
                ? "bg-primary/10 text-primary"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Customers
          </Link>
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin/users"
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                isActiveRoute("/admin/users")
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Users
            </Link>
          )}
          <div className="relative inline-flex items-center">
            <Link
              to="#"
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors text-gray-400 hover:text-gray-500"
              )}
              onClick={(e) => e.preventDefault()}
            >
              Estimates & Expenses
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                Coming soon
              </span>
            </Link>
          </div>
         
        </>
      )}
    </>
  );

  const PublicLinks = () => (
    <>
      <Link
        to="/about"
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-colors",
          isActiveRoute("/about")
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        About
      </Link>
      <Link
        to="/contact"
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-colors",
          isActiveRoute("/contact")
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Contact
      </Link>
      <Link
        to="/faq"
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-colors",
          isActiveRoute("/faq")
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        FAQ
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold">I</span>
          </div>
          <span className="text-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            Invoica
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLinks />
        </nav>

        <div className="flex items-center space-x-4">
          {/* Desktop Public Links */}
          <nav className="hidden md:flex items-center space-x-1 mr-2">
            <PublicLinks />
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks />
                  <div className="h-px bg-gray-200 my-4" />
                  <PublicLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <UserAvatar />
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
              <Button className="bg-primary hover:bg-primary-600 text-white shadow-sm">
              Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
