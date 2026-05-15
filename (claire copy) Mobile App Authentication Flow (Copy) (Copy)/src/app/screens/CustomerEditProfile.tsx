import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, Camera } from "lucide-react";

export default function CustomerEditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "Maria",
    lastName: "Santos",
    email: "maria.santos@email.com",
    phone: "+63 912 345 6789",
    dateOfBirth: "1995-06-15",
    gender: "Female",
  });

  const handleSave = () => {
    // In production, this would call an API
    navigate("/customer/profile");
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Top Navigation Bar */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0 border-b border-[#f2f2f2]">
        <button
          onClick={handleCancel}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Edit Profile
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto px-[24px] pb-[120px]"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style>
          {`
            .flex-1::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center py-[32px]">
          <div className="relative mb-[12px]">
            <div className="w-[100px] h-[100px] rounded-full bg-[#56C490] flex items-center justify-center">
              <span className="font-['Nunito',sans-serif] text-[36px] text-white">
                MS
              </span>
            </div>
            <button className="absolute bottom-0 right-0 w-[32px] h-[32px] rounded-full bg-[#56C490] flex items-center justify-center shadow-[0_2px_8px_rgba(86,196,144,0.3)] transition-all active:scale-95">
              <Camera className="w-[16px] h-[16px] text-white" />
            </button>
          </div>
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
            Change Profile Photo
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-[20px]">
          {/* First Name */}
          <div>
            <label className="block font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px]">
              First Name <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
              placeholder="Enter first name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px]">
              Last Name <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
              placeholder="Enter last name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px]">
              Email <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
              placeholder="Enter email address"
            />
          </div>

          {/* Phone Number (readonly, verified) */}
          <div>
            <label className="block font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px]">
              Phone Number <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                readOnly
                className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#6B7280] cursor-not-allowed"
                placeholder="+63"
              />
              <div className="absolute right-[16px] top-1/2 -translate-y-1/2 px-[8px] py-[4px] bg-[#56C490]/10 rounded-[6px]">
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#56C490]">
                  Verified
                </p>
              </div>
            </div>
            <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mt-[6px]">
              Phone number is verified and cannot be changed
            </p>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px]">
              Date of Birth <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-50"
              style={{ colorScheme: 'light' }}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px]">
              Gender <span className="text-[#EF4444]">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
              }}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed left-0 right-0 bottom-0 bg-white border-t border-[#f2f2f2] px-[24px] pt-[12px] pb-[8px] flex-shrink-0 z-40">
        <div className="flex gap-[12px]">
          <button
            onClick={handleCancel}
            className="flex-1 h-[50px] bg-white border-2 border-[#e5e5e5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[16px] rounded-[50px] transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-[50px] bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] rounded-[50px] transition-all active:scale-95 shadow-[0_4px_16px_rgba(86,196,144,0.25)]"
          >
            Save Changes
          </button>
        </div>
        {/* Home Indicator — iOS Safe Area */}
        <div className="h-[34px] relative">
          <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
        </div>
      </div>
    </div>
  );
}