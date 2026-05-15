import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, Camera, Mail, Phone, MapPin, Check } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState("Karen Santos");
  const [email, setEmail] = useState("karen.santos@email.com");
  const [phone, setPhone] = useState("+63 912 345 6789");
  const [address, setAddress] = useState("123 Bonifacio St, Makati City, Metro Manila");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Show success message
    setIsLoading(false);
    setShowSuccess(true);
    
    // Wait for success animation, then redirect
    setTimeout(() => {
      navigate("/customer/home");
    }, 1200);
  };

  return (
    <MobileContainer>
      <div className="h-full bg-white flex flex-col">
        {/* Status Bar */}
        <div className="bg-white flex-shrink-0">
          <StatusBar />
        </div>

        {/* Header */}
        <div className="bg-white px-[24px] py-[16px] flex items-center gap-[16px] flex-shrink-0 border-b border-[#F2F2F2]">
          <button onClick={() => navigate(-1)} className="active:scale-90 transition-transform">
            <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
          </button>
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            My Profile
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-[100px]">
          <div className="px-[24px] py-[32px] space-y-[32px]">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-[96px] h-[96px] rounded-full bg-gradient-to-br from-[#56C490] to-[#00a055] flex items-center justify-center">
                  <span className="font-['Nunito',sans-serif] text-[40px] text-white">
                    K
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 w-[32px] h-[32px] rounded-full bg-[#56C490] flex items-center justify-center border-4 border-white active:scale-90 transition-transform">
                  <Camera className="w-[16px] h-[16px] text-white" />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-[20px]">
              <div>
                <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                />
              </div>

              <div>
                <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-[48px] pr-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-[48px] pr-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-[16px] top-[16px] w-[20px] h-[20px] text-[#9CA3AF]" />
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full pl-[48px] pr-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveChanges}
              disabled={isLoading || showSuccess}
              className="w-full py-[14px] rounded-[12px] bg-[#56C490] font-['Nunito',sans-serif] text-[16px] text-white active:scale-[0.97] transition-transform disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-[8px]"
            >
              {isLoading ? (
                <>
                  <div className="w-[20px] h-[20px] border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : showSuccess ? (
                <>
                  <Check className="w-[20px] h-[20px]" />
                  <span>Profile updated successfully!</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </MobileContainer>
  );
}