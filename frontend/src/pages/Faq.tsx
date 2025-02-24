import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Invoica?",
    answer: "Invoica is a professional invoicing platform designed to help businesses create, manage, and track invoices efficiently. Our platform offers features like customizable templates, automatic invoice numbering, and secure payment processing."
  },
  {
    question: "How do I get started?",
    answer: "Getting started is easy! Simply sign up for an account, complete your profile with your business details, and you can start creating professional invoices right away. Our intuitive interface will guide you through the process."
  },
  {
    question: "What payment methods are supported?",
    answer: "We support various payment methods including credit cards, bank transfers, and digital wallets. You can customize which payment methods to accept for each invoice."
  },
  {
    question: "Can I customize my invoices?",
    answer: "Yes! You can customize your invoices with your company logo, colors, and preferred layout. You can also add your signature and specific payment terms to maintain a professional appearance."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We take security seriously and use industry-standard encryption to protect your data. All information is stored securely and backed up regularly."
  },
  {
    question: "Do you offer customer support?",
    answer: "Yes, we provide comprehensive customer support through email, phone, and live chat. Our support team is available during business hours to help you with any questions or issues."
  }
];

const Faq = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Card className="p-8 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent mb-6">
              Frequently Asked Questions
            </h1>
            
            <p className="text-gray-600 text-center mb-12">
              Find answers to common questions about Invoica
            </p>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Faq;
