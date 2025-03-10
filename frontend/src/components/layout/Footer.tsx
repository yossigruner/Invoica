import { Mail, Phone, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold">I</span>
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                Invoica
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Professional invoicing made simple
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-4 w-4" />
                <span>support@invoica.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="w-4 h-4" />
                +1 (555) 123-4567
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Invoica. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
