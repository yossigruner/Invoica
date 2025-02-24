import { Card } from "@/components/ui/card";
import { BookOpen, Users, Star } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Card className="p-8 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent mb-6">
              About InspectaInvoice
            </h1>
            
            <p className="text-gray-600 text-center mb-12">
              Your trusted partner in professional invoice management, making billing simple and efficient.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Easy to Use</h3>
                <p className="text-gray-600">
                  Intuitive interface designed for businesses of all sizes
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Customer-Focused</h3>
                <p className="text-gray-600">
                  Built with your needs in mind, supporting your business growth
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Professional</h3>
                <p className="text-gray-600">
                  Create beautiful, professional invoices that reflect your brand
                </p>
              </div>
            </div>

            <div className="border-t pt-12">
              <h2 className="text-2xl font-semibold mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                At InspectaInvoice, we're committed to simplifying the invoicing process for businesses worldwide. Our platform combines powerful features with user-friendly design to help you manage your billing efficiently and professionally.
              </p>
              <p className="text-gray-600">
                We believe that every business, regardless of size, deserves access to professional-grade invoicing tools. That's why we've created a solution that's both powerful and accessible, helping you focus on what matters most - growing your business.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AboutUs;
