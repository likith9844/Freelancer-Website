"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    category: "client_support",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate support ticket creation
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">Get in Touch</span>
          <h1 className="mt-2 text-4xl font-extrabold text-navy-900 tracking-tight font-display sm:text-5xl">
            Contact KaryaSetu Support
          </h1>
          <p className="mt-3 text-base text-slate-500">
            Have questions about milestone escrows, enterprise hiring, or freelancer verification? Our Indian support desk is here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Information Column */}
          <div className="space-y-6">
            <Card className="p-6 bg-white border-slate-200">
              <div className="flex items-center gap-3 text-navy-900 font-bold mb-4">
                <MapPin className="h-5 w-5 text-saffron-600" />
                <span>Corporate Headquarters</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                KaryaSetu Technologies India Pvt. Ltd.<br />
                Tower B, 4th Floor, Tech Park,<br />
                Outer Ring Road, Bellandur,<br />
                Bengaluru, Karnataka 560103, India
              </p>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <div className="flex items-center gap-3 text-navy-900 font-bold mb-4">
                <Mail className="h-5 w-5 text-saffron-600" />
                <span>Direct Email Inquiries</span>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <div>
                  <div className="font-semibold text-slate-800">General & Client Support:</div>
                  <a href="mailto:support@karyasetu.in" className="text-saffron-700 hover:underline">support@karyasetu.in</a>
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Enterprise & Custom MSA:</div>
                  <a href="mailto:enterprise@karyasetu.in" className="text-saffron-700 hover:underline">enterprise@karyasetu.in</a>
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Contract Dispute Escalation:</div>
                  <a href="mailto:disputes@karyasetu.in" className="text-saffron-700 hover:underline">disputes@karyasetu.in</a>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <div className="flex items-center gap-3 text-navy-900 font-bold mb-2">
                <Clock className="h-5 w-5 text-saffron-600" />
                <span>Operating Hours</span>
              </div>
              <p className="text-xs text-slate-600">
                Monday to Saturday: 9:00 AM – 8:00 PM IST<br />
                Emergency Dispute Support: 24/7 Monitoring
              </p>
            </Card>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white border-slate-200">
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-navy-900">Message Received!</h3>
                  <p className="mt-2 text-xs text-slate-500 max-w-md mx-auto">
                    Ticket #KS-SPT-{(Math.random() * 100000).toFixed(0)} has been logged. An assigned support specialist will respond within 4 business hours.
                  </p>
                  <div className="mt-6">
                    <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                      Submit Another Message
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 mb-1">Your Full Name *</label>
                      <Input
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 mb-1">Work Email Address *</label>
                      <Input
                        required
                        type="email"
                        placeholder="e.g. rahul@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 mb-1">Phone Number (with +91)</label>
                      <Input
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 mb-1">Inquiry Category *</label>
                      <select
                        className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-saffron-600 focus:outline-none"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="client_support">Client Project & Billing Help</option>
                        <option value="freelancer_support">Freelancer KYC & Payout Inquiry</option>
                        <option value="enterprise">Enterprise Custom Hiring</option>
                        <option value="dispute">Milestone Dispute Escalation</option>
                        <option value="legal">Legal & Compliance</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 mb-1">Subject *</label>
                    <Input
                      required
                      placeholder="Brief summary of your inquiry"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 mb-1">Detailed Message *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Please provide complete details, project references, or ticket context..."
                      className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 focus:border-saffron-600 focus:outline-none focus:ring-1 focus:ring-saffron-500"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <Button type="submit" variant="saffron" className="w-full sm:w-auto gap-2">
                    <Send className="h-4 w-4" />
                    <span>Send Message to Support</span>
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
