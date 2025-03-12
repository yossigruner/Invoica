import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const faqs = [
  {
    question: "How do I create my first invoice?",
    answer: "Creating your first invoice is easy! Simply click the 'Create Invoice' button, fill in your client's details, add line items, and customize the design. You can preview your invoice before sending it to ensure everything looks perfect.",
  },
  {
    question: "What payment methods do you support?",
    answer: "We support multiple payment methods including credit cards, bank transfers, and popular payment gateways like PayPal and Stripe. You can customize which payment methods to accept for each invoice.",
  },
  {
    question: "Can I customize my invoice design?",
    answer: "Yes! You can fully customize your invoice design including colors, fonts, and layout. You can also add your company logo and branding elements to make your invoices look professional and consistent with your brand.",
  },
  {
    question: "How do I manage my clients?",
    answer: "You can manage your clients through the 'Customers' section. Add new clients, store their information, and easily select them when creating new invoices. You can also track payment history and outstanding balances for each client.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and regular security audits to ensure your information is protected.",
  },
  {
    question: "What happens if a client doesn't pay?",
    answer: "We provide automated payment reminders and late payment notifications. You can also set up automatic follow-up emails and track payment status. For persistent issues, we offer collection letter templates and payment tracking tools.",
  },
];

const Faq = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen from-primary-50/50 via-white to-primary-100/50">
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <Card className="max-w-4xl mx-auto p-8 sm:p-10 shadow-xl bg-white/80 backdrop-blur-sm border-primary/10">
          <div className="text-center space-y-4 mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our invoicing platform.
            </p>

            <div className="max-w-xl mx-auto mt-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white/70 backdrop-blur-sm focus:bg-white transition-colors duration-200 w-full"
                />
              </div>
            </div>
          </div>

          <Card className="p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow duration-300 border-primary/10">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-b border-gray-100 last:border-0"
                >
                  <AccordionTrigger className="text-left text-lg font-medium py-4 hover:text-primary-600 transition-colors duration-200">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-gray-600 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <div className="mt-8 text-center space-y-6">
            <p className="text-base text-gray-600">
              Still have questions?{" "}
              <a 
                href="/contact" 
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
              >
                Contact our support team
              </a>
            </p>

            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <a href="/privacy" className="hover:text-primary-600 transition-colors duration-200">Privacy Policy</a>
              <span>•</span>
              <a href="/terms" className="hover:text-primary-600 transition-colors duration-200">Terms of Service</a>
              <span>•</span>
              <a href="/support" className="hover:text-primary-600 transition-colors duration-200">Support</a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Faq;
