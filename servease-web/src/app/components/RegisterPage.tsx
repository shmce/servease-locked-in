"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, MapPin, Phone, User } from "lucide-react";
import { registerCustomer } from "../lib/customer-auth";

export function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerCustomer({
        fullName,
        email,
        password,
        contactNumber,
        address,
      });
      router.push("/login?registered=1");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.",
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
            Create your ServEase account
          </h1>
          <p className="font-['Poppins',sans-serif] text-base text-gray-600">
            Book trusted providers and track every service request from your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md p-8 space-y-5"
        >
          <InputField
            icon={<User size={20} />}
            label="Full name"
            value={fullName}
            onChange={setFullName}
            placeholder="Juan dela Cruz"
            required
          />
          <InputField
            icon={<Mail size={20} />}
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
          />
          <InputField
            icon={<Phone size={20} />}
            label="Mobile number"
            value={contactNumber}
            onChange={setContactNumber}
            placeholder="0917 123 4567"
          />
          <InputField
            icon={<MapPin size={20} />}
            label="Default service address"
            value={address}
            onChange={setAddress}
            placeholder="Condo, street, barangay, city"
          />

          <div>
            <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63]"
                placeholder="At least 8 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <InputField
            icon={<Lock size={20} />}
            label="Confirm password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repeat your password"
            required
          />

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
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>

          <p className="font-['Poppins',sans-serif] text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-[#00A356] font-semibold">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function InputField({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63]"
          placeholder={placeholder}
          required={required}
        />
      </div>
    </div>
  );
}
