"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { TermsConditions } from "./TermsConditions";
import { PrivacyPolicy } from "./PrivacyPolicy";

export function ProviderRegStep1() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Password validation checks
  const passwordValidation = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Full Name validation (2-100 characters)
    if (formData.fullName.length < 2 || formData.fullName.length > 100) {
      newErrors.fullName = "Full name must be between 2-100 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Contact Number validation (10 digits for Philippine numbers)
    const phoneRegex = /^[1-9]\d{9}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be 10 digits starting with 1-9";
    }

    // Password validation (minimum 8 characters with uppercase, lowercase, and number)
    if (!passwordValidation.minLength || !passwordValidation.hasUppercase || !passwordValidation.hasLowercase || !passwordValidation.hasNumber) {
      newErrors.password = "Password does not meet the requirements";
    }

    // Confirm Password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && acceptedPolicies) {
      // Store data in sessionStorage
      sessionStorage.setItem("providerRegStep1", JSON.stringify(formData));
      router.push("/provider-registration/step-2");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-['Poppins',sans-serif] text-3xl md:text-4xl text-gray-900 mb-3">
            Join ServEase as a Service Worker
          </h1>
          <p className="font-['Poppins',sans-serif] text-base text-gray-600">
            Complete your registration to start offering your services
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-['Poppins',sans-serif] text-sm text-gray-600">Step 1 of 4</span>
            <span className="font-['Poppins',sans-serif] text-sm text-[#00BF63] font-semibold">25%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#00BF63] h-2 rounded-full transition-all duration-300" style={{ width: "25%" }}></div>
          </div>
          <div className="flex justify-between mt-3">
            <span className="font-['Poppins',sans-serif] text-xs text-[#00BF63] font-semibold">Personal Info</span>
            <span className="font-['Poppins',sans-serif] text-xs text-gray-400">Profile</span>
            <span className="font-['Poppins',sans-serif] text-xs text-gray-400">Location</span>
            <span className="font-['Poppins',sans-serif] text-xs text-gray-400">Documents</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="font-['Poppins',sans-serif] text-2xl text-gray-900 mb-6">
            Personal Information & Account
          </h2>

          <form onSubmit={handleNext} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63]`}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              {errors.fullName && (
                <p className="font-['Poppins',sans-serif] text-xs text-red-500 mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63]`}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              {errors.email && (
                <p className="font-['Poppins',sans-serif] text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <div className={`relative flex border ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus-within:ring-2 focus-within:ring-[#00BF63]/50 focus-within:border-[#00BF63]`}>
                <div className="flex items-center justify-center bg-white border-r border-gray-200 rounded-l-lg px-3">
                  <Phone className="text-[#374151] mr-2" size={20} />
                  <span className="font-['Poppins',sans-serif] text-sm text-[#374151]">+63</span>
                </div>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="flex-1 pl-4 pr-4 py-3 bg-white rounded-r-lg font-['Poppins',sans-serif] text-sm focus:outline-none border-none"
                  placeholder="9123456789"
                  required
                  maxLength={10}
                />
              </div>
              {errors.contactNumber && (
                <p className="font-['Poppins',sans-serif] text-xs text-red-500 mt-1">{errors.contactNumber}</p>
              )}
              <p className="font-['Poppins',sans-serif] text-xs text-gray-500 mt-1">10 digits, starting with 9</p>
            </div>

            {/* Password */}
            <div>
              <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63]`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="font-['Poppins',sans-serif] text-xs text-red-500 mt-1">{errors.password}</p>
              )}
              {/* Password Requirements */}
              <div className="mt-3">
                <p className="font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">Password must contain:</p>
                <div className="flex items-center gap-2 mb-1">
                  <Check className={`${passwordValidation.minLength ? 'text-[#00BF63]' : 'text-gray-300'} flex-shrink-0`} size={16} />
                  <span className={`font-['Poppins',sans-serif] text-sm ${passwordValidation.minLength ? 'text-[#00BF63]' : 'text-gray-500'}`}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Check className={`${passwordValidation.hasUppercase ? 'text-[#00BF63]' : 'text-gray-300'} flex-shrink-0`} size={16} />
                  <span className={`font-['Poppins',sans-serif] text-sm ${passwordValidation.hasUppercase ? 'text-[#00BF63]' : 'text-gray-500'}`}>
                    One uppercase letter (A–Z)
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Check className={`${passwordValidation.hasLowercase ? 'text-[#00BF63]' : 'text-gray-300'} flex-shrink-0`} size={16} />
                  <span className={`font-['Poppins',sans-serif] text-sm ${passwordValidation.hasLowercase ? 'text-[#00BF63]' : 'text-gray-500'}`}>
                    One lowercase letter (a–z)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`${passwordValidation.hasNumber ? 'text-[#00BF63]' : 'text-gray-300'} flex-shrink-0`} size={16} />
                  <span className={`font-['Poppins',sans-serif] text-sm ${passwordValidation.hasNumber ? 'text-[#00BF63]' : 'text-gray-500'}`}>
                    One number (0–9)
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63]`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="font-['Poppins',sans-serif] text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Accept Policies */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="acceptedPolicies"
                checked={acceptedPolicies}
                onChange={() => setAcceptedPolicies(!acceptedPolicies)}
                className="w-4 h-4 text-[#00BF63] bg-gray-100 border-gray-300 rounded focus:ring-[#00BF63] focus:ring-2"
                required
              />
              <label className="ml-2 font-['Poppins',sans-serif] text-sm text-gray-700">
                I accept the{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTermsModal(true);
                  }}
                  className="text-[#00BF63] font-semibold hover:underline"
                >
                  Terms & Conditions
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPrivacyModal(true);
                  }}
                  className="text-[#00BF63] font-semibold hover:underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Next Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-[#00BF63] hover:bg-[#00a855] text-white font-['Poppins',sans-serif] font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Continue to Profile
                <ArrowRight size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      <TermsConditions isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />

      {/* Privacy Policy Modal */}
      <PrivacyPolicy isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  );
}
