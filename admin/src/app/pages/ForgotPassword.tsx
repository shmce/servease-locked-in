import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft, Loader2, CheckCircle, Mail } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#00BF63] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00BF63] to-[#00A055] opacity-90"></div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 bg-[#00BF63] rounded-lg"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">ServEase</h1>
                <p className="text-white/80 text-sm">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/30 mx-auto mb-8">
              <Mail className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Reset Your Password</h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Enter your email address and we'll send you a secure link to reset your admin
              password.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-[460px]">
          {/* Mobile Brand Header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-[#00BF63] rounded-xl flex items-center justify-center">
                <div className="w-7 h-7 bg-white rounded-lg"></div>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">ServEase</h1>
                <p className="text-sm text-gray-600">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {!isSuccess ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Reset password</h2>
                  <p className="text-gray-600 mt-1">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g., juan@servease.ph"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                    <p className="text-xs text-gray-500">
                      Must be a registered admin email address
                    </p>
                  </div>

                  {/* Send Reset Link Button */}
                  <Button
                    type="submit"
                    className="w-full bg-[#00BF63] hover:bg-[#00A055] h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending reset link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>

                  {/* Back to Sign In */}
                  <div className="pt-4">
                    <Link
                      to="/login"
                      className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Sign in
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-[#00BF63]" />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                  <p className="text-gray-600 mb-6">
                    If an admin account exists for{" "}
                    <span className="font-medium text-gray-900">{email}</span>, we sent a reset
                    link.
                  </p>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6 text-left">
                    <p className="text-sm text-gray-700 font-medium mb-2">What's next?</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li className="flex items-start gap-2">
                        <span className="text-[#00BF63] mt-1">•</span>
                        <span>Check your inbox for the password reset email</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00BF63] mt-1">•</span>
                        <span>Click the secure link in the email</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00BF63] mt-1">•</span>
                        <span>Create a new password</span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-xs text-gray-500 mb-6">
                    Didn't receive the email? Check your spam folder or wait a few minutes.
                  </p>

                  <Link to="/login">
                    <Button className="w-full bg-[#00BF63] hover:bg-[#00A055]">
                      Back to Sign in
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-8">
            © 2026 ServEase Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
