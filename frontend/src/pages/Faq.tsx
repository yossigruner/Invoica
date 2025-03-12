import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  return (
    <div className="min-h-screen from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent mb-4 sm:mb-6">
            Frequently Asked Questions
          </h1>
          
          <p className="text-base sm:text-lg text-gray-600 text-center mb-8 sm:mb-12">
            Find answers to common questions about our invoicing platform.
          </p>

          <Card className="p-6 sm:p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base sm:text-lg font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm sm:text-base text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Still have questions?{" "}
              <a href="/contact" className="text-primary hover:text-primary/80 transition-colors">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
