import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ChevronLeft, Home as HomeIcon, Briefcase, MapPin, MoreVertical, Plus, Home, Calendar, MessageCircle, MoreHorizontal } from "lucide-react";

export default function ProviderManageAddresses() {
  const navigate = useNavigate();
  const [activeTab] = useState("more");

  const addresses = [
    {
      id: 1,
      label: "Home",
      icon: HomeIcon,
      address: "123 Mabini Street, Barangay San Jose",
      city: "Quezon City, Metro Manila",
      zipCode: "1100",
      isDefault: true,
    },
    {
      id: 2,
      label: "Office",
      icon: Briefcase,
      address: "456 Ayala Avenue, Makati Central Business District",
      city: "Makati City, Metro Manila",
      zipCode: "1226",
      isDefault: false,
    },
    {
      id: 3,
      label: "Other",
      icon: MapPin,
      address: "789 Rizal Boulevard, Bonifacio Global City",
      city: "Taguig City, Metro Manila",
      zipCode: "1634",
      isDefault: false,
    },
  ];

  return (
    <div className="bg-[#F8F8F8] w-full min-h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#00C16A] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] pt-[16px] pb-[16px] flex items-center justify-between border-b border-[#E5E7EB] flex-shrink-0">
        <div className="flex items-center gap-[16px]">
          <button
            onClick={() => navigate(-1)}
            className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all active:scale-90"
          >
            <ChevronLeft className="w-[24px] h-[24px] text-[#111827]" />
          </button>
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Manage Addresses
          </h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[16px]">
        <div className="px-[24px] pt-[16px]">
          {/* Add New Address Button - Full Width at Top */}
          <button className="w-full bg-[#00C16A] rounded-[12px] p-[16px] flex items-center justify-center gap-[8px] transition-all active:scale-95 mb-[20px]">
            <Plus className="w-[20px] h-[20px] text-white" />
            <span className="font-['Nunito',sans-serif] text-[16px] text-white">
              Add New Address
            </span>
          </button>

          {/* Address Cards */}
          <div className="space-y-[12px] mb-[20px]">
            {addresses.map((address) => {
              const Icon = address.icon;
              return (
                <div
                  key={address.id}
                  className="bg-white p-[16px] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-start justify-between mb-[12px]">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[40px] h-[40px] rounded-full bg-[#00C16A]/10 flex items-center justify-center">
                        <Icon className="w-[20px] h-[20px] text-[#00C16A]" />
                      </div>
                      <div>
                        <h3 className="font-['Nunito',sans-serif] text-[15px] text-[#111827]">
                          {address.label}
                        </h3>
                        {address.isDefault && (
                          <span className="inline-block px-[8px] py-[2px] rounded-[4px] bg-[#00C16A]/10 font-['Nunito',sans-serif] text-[10px] text-[#00C16A] mt-[4px]">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="w-[32px] h-[32px] flex items-center justify-center">
                      <MoreVertical className="w-[20px] h-[20px] text-[#6B7280]" />
                    </button>
                  </div>

                  <div className="pl-[52px]">
                    <p className="font-['Poppins',sans-serif] text-[14px] text-[#374151] leading-[1.6] mb-[4px]">
                      {address.address}
                    </p>
                    <p className="font-['Poppins',sans-serif] text-[13px] text-[#6B7280]">
                      {address.city} {address.zipCode}
                    </p>

                    <div className="flex gap-[12px] mt-[16px]">
                      <button className="flex-1 h-[36px] rounded-[8px] border border-[#E5E7EB] bg-white font-['Nunito',sans-serif] text-[13px] text-[#374151] transition-all active:scale-95">
                        Edit
                      </button>
                      {!address.isDefault && (
                        <button className="flex-1 h-[36px] rounded-[8px] bg-[#00C16A] font-['Nunito',sans-serif] text-[13px] text-white transition-all active:scale-95">
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}