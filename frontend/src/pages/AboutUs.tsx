import { Card } from "@/components/ui/card";
import { BookOpen, Users, Star } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <Card className="p-6 sm:p-8 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent mb-4 sm:mb-6">
              About Invoica
            </h1>
            
            <p className="text-base sm:text-lg text-gray-600 text-center mb-8 sm:mb-12">
              Your trusted partner in professional invoice management, making billing simple and efficient.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
              <div className="text-center space-y-4 p-4 sm:p-6 rounded-lg bg-white/50">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Easy to Use</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Intuitive interface designed for businesses of all sizes
                </p>
              </div>

              <div className="text-center space-y-4 p-4 sm:p-6 rounded-lg bg-white/50">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Customer-Focused</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Built with your needs in mind, supporting your business growth
                </p>
              </div>

              <div className="text-center space-y-4 p-4 sm:p-6 rounded-lg bg-white/50">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Professional Quality</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Enterprise-grade features for small to medium businesses
                </p>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="bg-white/50 p-6 sm:p-8 rounded-lg">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  At Invoica, we're dedicated to simplifying the invoicing process for businesses worldwide. 
                  Our platform combines powerful features with an intuitive interface to help you manage your 
                  finances more efficiently.
                </p>
              </div>

              <div className="bg-white/50 p-6 sm:p-8 rounded-lg">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">Our Vision</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  We envision a world where managing invoices is effortless and stress-free. 
                  Through continuous innovation and customer feedback, we're building the future 
                  of business invoicing.
                </p>
              </div>

              <div className="bg-white/50 p-6 sm:p-8 rounded-lg">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">Our Values</h2>
                <ul className="space-y-3 text-sm sm:text-base text-gray-600">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Customer Success: Your growth is our priority
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Innovation: Constantly improving our platform
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Reliability: Trusted by businesses worldwide
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AboutUs;
