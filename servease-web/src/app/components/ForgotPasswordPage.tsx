"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { requestCustomerPasswordReset } from "../lib/customer-auth";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setFeedback("");
    setIsSubmitting(true);

    try {
      await requestCustomerPasswordReset(email);
      setFeedback("If an account exists for that email, a reset link has been sent.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Password reset request failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-['Poppins',sans-serif] text-3xl md:text-4xl text-gray-900 mb-3">
            Reset your password
          </h1>
          <p className="font-['Poppins',sans-serif] text-base text-gray-600">
            Enter your account email and ServEase will send password reset instructions.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md p-8 space-y-5"
        >
          <div>
            <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63]"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {feedback && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-['Poppins',sans-serif] text-sm text-emerald-700">
                {feedback}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-['Poppins',sans-serif] text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#00BF63] hover:bg-[#00a855] disabled:cursor-not-allowed disabled:opacity-70 text-white font-['Poppins',sans-serif] font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="font-['Poppins',sans-serif] text-sm text-gray-600 text-center">
            Remembered your password?{" "}
            <Link href="/login" className="text-[#00A356] font-semibold">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
