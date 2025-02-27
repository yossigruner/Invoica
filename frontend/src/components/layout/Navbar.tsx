import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "./UserAvatar";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold">I</span>
          </div>
          <span className="text-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            Invoica
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
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
              >
                Customers
              </Link>
              <div className="relative inline-flex items-center">
                <Link
                  to="#"
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors text-gray-400 hover:text-gray-500"
                  )}
                  onClick={(e) => e.preventDefault()}
                >
                  Estimates
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                    Coming soon
                  </span>
                </Link>
              </div>
            </>
          )}
        </nav>

        <div className="flex items-center space-x-1">
          <nav className="hidden md:flex items-center space-x-1 mr-2">
            <Link
              to="/about"
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                isActiveRoute("/about")
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
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
            >
              FAQ
            </Link>
          </nav>

          {isAuthenticated ? (
            <UserAvatar />
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-primary hover:bg-primary-600 text-white shadow-sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
