import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/data-display";
import { FormField, FormLabel } from "@/components/ui/form";
import { toast } from "@/components/ui/feedback";

export const ContactPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Sales Inquiry");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Form incomplete", "Please fill in all required contact inputs.");
      return;
    }

    setIsSubmitting(true);
    // Simulate API form dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Message dispatched", "Thank you! Our support staff will contact you shortly.");
      setName("");
      setEmail("");
      setMessage("");
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-background/25 py-20 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-20">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-sm">
          Communication Channels
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
          Get in touch with{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            our support staff
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Have an inquiry regarding self-hosting or security headers configuration? Fill out the details below.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-8 items-start mb-16">
        {/* Contact details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 border-border bg-card/45 backdrop-blur-sm space-y-6">
            <h3 className="text-xs font-bold text-foreground">Support Channels</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 text-xs">
                <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/15 shrink-0 mt-0.5">
                  <Mail className="h-4 w-4" />
                </span>
                <div className="space-y-0.5">
                  <p className="font-extrabold text-foreground">Inquiries & Support</p>
                  <p className="text-[10px] text-muted-foreground">support@akirapm.io</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs">
                <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/15 shrink-0 mt-0.5">
                  <Phone className="h-4 w-4" />
                </span>
                <div className="space-y-0.5">
                  <p className="font-extrabold text-foreground">Technical Helpline</p>
                  <p className="text-[10px] text-muted-foreground">+1 (800) 555-0199</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs">
                <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/15 shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="space-y-0.5">
                  <p className="font-extrabold text-foreground">HQ Office Coordinates</p>
                  <p className="text-[10px] text-muted-foreground">100 Pine Street, San Francisco, CA 94111</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-border bg-card/35 backdrop-blur-sm text-[10px] text-muted-foreground flex gap-2.5">
            <HelpCircle className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Looking for custom SLA agreements? Fill in the form and detail your requirements. A customer service representative will follow up within one business day.
            </p>
          </Card>
        </div>

        {/* Message Form */}
        <Card className="md:col-span-3 p-6 sm:p-8 border-border bg-card/45 backdrop-blur-sm shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField>
                <FormLabel required>Full Name</FormLabel>
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </FormField>

              <FormField>
                <FormLabel required>Email Address</FormLabel>
                <Input
                  type="email"
                  placeholder="johndoe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </FormField>
            </div>

            <FormField>
              <FormLabel required>Topic Area</FormLabel>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <option value="Sales Inquiry">Sales & Enterprise Billing</option>
                <option value="Technical Support">Technical Setup & self-hosting</option>
                <option value="Security Audits">Compliance & Security Audits</option>
                <option value="Other">General Feedback</option>
              </select>
            </FormField>

            <FormField>
              <FormLabel required>Detailed Message</FormLabel>
              <Textarea
                rows={5}
                placeholder="Explain the context of your inquiry..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </FormField>

            <div className="pt-2 border-t border-border/20 flex justify-end">
              <Button type="submit" isLoading={isSubmitting} className="h-9 gap-1.5 font-bold px-4 shadow-sm">
                <Send className="h-3.5 w-3.5" /> Dispatch Inquiry
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
export default ContactPage;
