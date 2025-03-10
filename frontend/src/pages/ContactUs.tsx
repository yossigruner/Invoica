import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement contact form submission
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      toast.success("Message sent successfully");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent mb-4 sm:mb-6">
            Contact Us
          </h1>
          
          <p className="text-base sm:text-lg text-gray-600 text-center mb-8 sm:mb-12">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <div className="space-y-6">
              <Card className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="How can we help?"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="min-h-[120px] resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#7C5CFC] hover:bg-[#7C5CFC]/90 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold mb-6">Get in Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <p className="text-sm text-gray-600">support@invoica.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Phone</h3>
                      <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Office</h3>
                      <p className="text-sm text-gray-600">
                        123 Business Street<br />
                        Suite 100<br />
                        San Francisco, CA 94105
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold mb-6">Business Hours</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

