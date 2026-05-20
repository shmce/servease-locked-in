"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import {
  clearProviderRegistrationDraft,
  readProviderRegistrationDraft,
  submitProviderRegistration,
  uploadProviderRegistrationDocument,
} from "../lib/provider-registration";
import { createSupabaseBrowserClient } from "../lib/supabase-browser";

const idTypes = [
  "UMID",
  "Driver's License",
  "Philippine National ID (PhilID)",
  "Passport",
  "Postal ID",
];

export function ProviderRegStep4() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    idType: "",
    idFile: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // ID Type validation
    if (!formData.idType) {
      newErrors.idType = "Please select an ID type";
    }

    // File validation
    if (!formData.idFile) {
      newErrors.idFile = "Please upload a valid Philippine ID";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      sessionStorage.setItem("providerRegStep4", JSON.stringify({
        idType: formData.idType,
        fileName: fileName,
      }));

      const draft = readProviderRegistrationDraft();
      await submitProviderRegistration(draft);
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: sessionData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: draft.step1.email.trim(),
            password: draft.step1.password,
          });

        if (signInError || !sessionData.session?.access_token) {
          sessionStorage.setItem(
            "providerRegDocumentUploadWarning",
            "Your account was created, but we could not upload your ID document automatically. Please sign in and upload it from your provider account.",
          );
        } else if (formData.idFile) {
          await uploadProviderRegistrationDocument(
            sessionData.session.access_token,
            formData.idFile,
            "government_id",
          );
        }
      } catch {
        sessionStorage.setItem(
          "providerRegDocumentUploadWarning",
          "Your account was created, but your ID document upload failed. Please sign in and upload it from your provider account.",
        );
      }
      clearProviderRegistrationDraft();
      router.push("/provider-registration/success");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/provider-registration/step-3");
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setSubmitError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, idFile: "Please upload a valid image (JPG, PNG) or PDF file" }));
        setSubmitError("");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, idFile: "File size must be less than 5MB" }));
        setSubmitError("");
        return;
      }

      setFormData((prev) => ({ ...prev, idFile: file }));
      setFileName(file.name);
      setErrors((prev) => ({ ...prev, idFile: "" }));
      setSubmitError("");
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
            <span className="font-['Poppins',sans-serif] text-sm text-gray-600">Step 4 of 4</span>
            <span className="font-['Poppins',sans-serif] text-sm text-[#00BF63] font-semibold">100%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#00BF63] h-2 rounded-full transition-all duration-300" style={{ width: "100%" }}></div>
          </div>
          <div className="flex justify-between mt-3">
            <span className="font-['Poppins',sans-serif] text-xs text-gray-400">Personal Info</span>
            <span className="font-['Poppins',sans-serif] text-xs text-gray-400">Profile</span>
            <span className="font-['Poppins',sans-serif] text-xs text-gray-400">Location</span>
            <span className="font-['Poppins',sans-serif] text-xs text-[#00BF63] font-semibold">Documents</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="font-['Poppins',sans-serif] text-2xl text-gray-900 mb-6">
            Document Upload (KYC Verification)
          </h2>

          <form onSubmit={handleNext} className="space-y-5">
            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-['Poppins',sans-serif] text-sm text-blue-900 font-semibold mb-1">
                    Identity Verification Required
                  </h3>
                  <p className="font-['Poppins',sans-serif] text-xs text-blue-800 leading-relaxed">
                    Please upload a clear, valid Philippine ID for verification. This helps us maintain trust and safety on the ServEase platform.
                  </p>
                </div>
              </div>
            </div>

            {/* ID Type Selection */}
            <div>
              <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                Select ID Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  name="idType"
                  value={formData.idType}
                  onChange={handleSelectChange}
                  className={`w-full pl-11 pr-4 py-3 border ${errors.idType ? 'border-red-500' : 'border-gray-300'} rounded-lg font-['Poppins',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#00BF63]/50 focus:border-[#00BF63] appearance-none bg-white`}
                  required
                >
                  <option value="">Choose a valid Philippine ID</option>
                  {idTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {errors.idType && (
                <p className="font-['Poppins',sans-serif] text-xs text-red-500 mt-1">{errors.idType}</p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block font-['Poppins',sans-serif] text-sm text-gray-700 mb-2">
                Upload ID Document <span className="text-red-500">*</span>
              </label>
              
              <div className={`relative border-2 ${errors.idFile ? 'border-red-500' : formData.idFile ? 'border-[#00BF63]' : 'border-dashed border-gray-300'} rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors`}>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                
                {!formData.idFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#00BF63]/10 rounded-full flex items-center justify-center mb-4">
                      <Upload className="text-[#00BF63]" size={28} />
                    </div>
                    <p className="font-['Poppins',sans-serif] text-sm text-gray-700 font-semibold mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="font-['Poppins',sans-serif] text-xs text-gray-500">
                      JPG, PNG, or PDF (max 5MB)
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#00BF63] rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="text-white" size={28} />
                    </div>
                    <p className="font-['Poppins',sans-serif] text-sm text-gray-900 font-semibold mb-1">
                      File Uploaded Successfully
                    </p>
                    <p className="font-['Poppins',sans-serif] text-xs text-gray-600">
                      {fileName}
                    </p>
                    <p className="font-['Poppins',sans-serif] text-xs text-[#00BF63] mt-2">
                      Click to replace file
                    </p>
                  </div>
                )}
              </div>
              
              {errors.idFile && (
                <p className="font-['Poppins',sans-serif] text-xs text-red-500 mt-2">{errors.idFile}</p>
              )}
            </div>

            {/* Privacy Note */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-['Poppins',sans-serif] text-xs text-gray-600 leading-relaxed">
                <strong className="text-gray-900">Privacy & Security:</strong> Your ID is uploaded to ServEase storage after account creation and is visible only to authorized review staff.
              </p>
            </div>

            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="font-['Poppins',sans-serif] text-sm text-red-700">
                  {submitError}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 text-gray-700 font-['Poppins',sans-serif] font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#00BF63] hover:bg-[#00a855] disabled:cursor-not-allowed disabled:opacity-70 text-white font-['Poppins',sans-serif] font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
                {!isSubmitting && <ArrowRight size={20} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
