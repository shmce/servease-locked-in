"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { createSupportTicket } from "../lib/support-tickets";
import { createSupabaseBrowserClient } from "../lib/supabase-browser";

function createSupabaseState() {
  try {
    return {
      supabase: createSupabaseBrowserClient(),
      setupError: "",
    };
  } catch (setupError) {
    return {
      supabase: null,
      setupError:
        setupError instanceof Error
          ? setupError.message
          : "Supabase login is not configured.",
    };
  }
}

export function ContactPage() {
  const [{ supabase, setupError }] = useState(createSupabaseState);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [feedback, setFeedback] = useState("");
  const [isError, setIsError] = useState(Boolean(setupError));
  const [requiresSignIn, setRequiresSignIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback("");
    setIsError(false);
    setRequiresSignIn(false);

    if (!supabase) {
      setFeedback(setupError || "Supabase login is not configured.");
      setIsError(true);
      return;
    }

    setIsSubmitting(true);

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      setFeedback("Please sign in before submitting a support request.");
      setRequiresSignIn(true);
      setIsError(true);
      setIsSubmitting(false);
      return;
    }

    const messageWithContact = [
      `Contact name: ${form.name.trim()}`,
      `Contact email: ${form.email.trim()}`,
      "",
      form.message.trim(),
    ].join("\n");

    try {
      const ticket = await createSupportTicket(
        sessionData.session.access_token,
        {
          subject: form.subject,
          message: messageWithContact,
          category: "general",
        },
      );

      setFeedback(
        ticket.id
          ? `Thank you. Your support ticket ${ticket.id} has been created.`
          : "Thank you. Your support ticket has been created.",
      );
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Could not submit your support request.",
      );
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="bg-[#00BF63] py-16 md:py-24 px-6 md:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-['Poppins',sans-serif] text-3xl md:text-5xl text-white mb-6">
            Get in Touch
          </h1>
          <p className="font-['Poppins',sans-serif] text-base md:text-lg text-white/90 max-w-xl mx-auto">
            Have a question, feedback, or need support? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24 px-6 md:px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="font-['Poppins',sans-serif] text-2xl text-gray-900 mb-6">
              Send Us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="font-['Poppins',sans-serif] text-sm text-gray-700 block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 font-['Poppins',sans-serif] text-sm focus:outline-none focus:border-[#00BF63] transition-colors bg-white"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="font-['Poppins',sans-serif] text-sm text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 font-['Poppins',sans-serif] text-sm focus:outline-none focus:border-[#00BF63] transition-colors bg-white"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="font-['Poppins',sans-serif] text-sm text-gray-700 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 font-['Poppins',sans-serif] text-sm focus:outline-none focus:border-[#00BF63] transition-colors bg-white"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="font-['Poppins',sans-serif] text-sm text-gray-700 block mb-1">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 font-['Poppins',sans-serif] text-sm focus:outline-none focus:border-[#00BF63] transition-colors resize-none bg-white"
                  placeholder="Tell us more..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#00BF63] hover:bg-[#00a855] disabled:cursor-not-allowed disabled:opacity-70 text-white font-['Inter',sans-serif] px-8 py-3 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Send size={18} />
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
              {feedback && (
                <div
                  className={`rounded-xl border p-4 ${
                    isError
                      ? "border-red-200 bg-red-50"
                      : "border-[#00BF63]/20 bg-[#00BF63]/10"
                  }`}
                >
                  <p
                    className={`font-['Poppins',sans-serif] text-sm ${
                      isError ? "text-red-700" : "text-[#007A3F]"
                    }`}
                  >
                    {feedback}
                  </p>
                  {requiresSignIn && (
                    <Link
                      href="/login"
                      className="mt-2 inline-block font-['Poppins',sans-serif] text-sm text-[#00BF63] underline underline-offset-4"
                    >
                      Sign in to continue
                    </Link>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Contact Info & Map */}
          <div>
            <h2 className="font-['Poppins',sans-serif] text-2xl text-gray-900 mb-6">
              Contact Information
            </h2>
            <div className="space-y-6 mb-8">
              {[
                { icon: Mail, label: "Email", value: "support@servease.app" },
                { icon: Phone, label: "Phone", value: "+1 (800) 555-EASE" },
                { icon: MapPin, label: "Address", value: "123 Service Lane, Tech City, TC 10001" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#00BF63]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon size={22} className="text-[#00BF63]" />
                  </div>
                  <div>
                    <p className="font-['Poppins',sans-serif] text-sm text-gray-500">{item.label}</p>
                    <p className="font-['Poppins',sans-serif] text-base text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Placeholder Map */}
            <div className="bg-[#f1f1f1] rounded-2xl h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={40} className="text-[#00BF63] mx-auto mb-2" />
                <p className="font-['Poppins',sans-serif] text-sm text-gray-500">Map Placeholder</p>
                <p className="font-['Poppins',sans-serif] text-xs text-gray-400">123 Service Lane, Tech City</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
