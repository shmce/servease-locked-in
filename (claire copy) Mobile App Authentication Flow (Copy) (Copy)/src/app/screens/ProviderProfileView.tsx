import { useState, startTransition } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { BackButton } from "../components/BackButton";
import {
  Settings,
  MapPin,
  Star,
  CheckCircle,
  Clock,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { formatPeso } from "../utils/formatPeso";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
}

interface PortfolioItem {
  id: string;
  imageUrl: string;
}

export default function ProviderProfileView() {
  const navigate = useNavigate();

  // Mock data
  const services: Service[] = [
    {
      id: "1",
      name: "House Cleaning",
      description: "Standard house cleaning service including all rooms",
      price: 500,
      duration: "3-4 hours",
    },
    {
      id: "2",
      name: "Deep Cleaning",
      description: "Thorough deep cleaning with sanitization",
      price: 800,
      duration: "4-6 hours",
    },
    {
      id: "3",
      name: "Office Cleaning",
      description: "Professional office cleaning service",
      price: 1200,
      duration: "2-3 hours",
    },
  ];

  const portfolioItems: PortfolioItem[] = [
    {
      id: "1",
      imageUrl:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzQ4NTU3NTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "2",
      imageUrl:
        "https://images.unsplash.com/photo-1681395565141-7fef718af7e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMG1vZGVybiUyMGtpdGNoZW58ZW58MXx8fHwxNzc0ODc5MTU1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ];

  return (
    <div className="bg-[#F9FAFB] w-full min-h-screen flex flex-col max-w-[430px] mx-auto">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] py-[12px] border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
        <BackButton />
        <h1 className="font-semibold text-[18px] text-[#111827]">Profile</h1>
        <button
          onClick={() => startTransition(() => navigate("/provider/edit-profile/advanced"))}
          className="transition-all active:opacity-70"
        >
          <Settings className="w-[24px] h-[24px] text-[#6B7280]" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[24px]">
        {/* Cover Photo & Profile Section */}
        <div className="relative bg-white mb-[8px]">
          {/* Cover Photo */}
          <div className="relative h-[140px] bg-gradient-to-br from-[#56C490] via-[#00A355] to-[#008F48]" />

          {/* Profile Info - Overlapping */}
          <div className="px-[24px] pb-[20px]">
            {/* Profile Photo - Overlapping cover */}
            <div className="relative -mt-[50px] mb-[12px]">
              <div className="w-[100px] h-[100px] rounded-full bg-[#56C490] flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-white text-[36px] font-bold">JC</span>
              </div>
              <div className="absolute bottom-[2px] right-[2px] w-[32px] h-[32px] rounded-full bg-[#56C490] flex items-center justify-center shadow-md border-2 border-white">
                <CheckCircle className="w-[18px] h-[18px] text-white" />
              </div>
            </div>

            {/* Business Name & Location */}
            <div className="mb-[12px]">
              <h2 className="text-[#111827] text-[20px] font-bold mb-[4px]">
                Juan's Professional Cleaning
              </h2>
              <div className="flex items-center gap-[6px] text-[#6B7280] mb-[8px]">
                <MapPin className="w-[14px] h-[14px]" />
                <span className="text-[14px]">Metro Manila, Philippines</span>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="flex items-center gap-[4px]">
                  <Star className="w-[16px] h-[16px] text-[#FBBF24] fill-[#FBBF24]" />
                  <span className="text-[#111827] text-[15px] font-semibold">
                    4.9
                  </span>
                  <span className="text-[#9CA3AF] text-[14px]">(127)</span>
                </div>
                <div className="flex items-center gap-[4px] text-[#6B7280]">
                  <Clock className="w-[14px] h-[14px]" />
                  <span className="text-[14px]">8 years experience</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-[#374151] text-[14px] leading-[20px]">
              With over 8 years of professional cleaning experience, I take
              pride in delivering exceptional service to every client.
              Specialized in residential and commercial cleaning with a focus on
              quality and customer satisfaction.
            </p>
          </div>
        </div>

        {/* Services & Pricing Section */}
        <div className="bg-white px-[24px] py-[20px] mb-[8px]">
          <div className="flex items-center justify-between mb-[16px]">
            <h3 className="text-[#111827] text-[16px] font-semibold">
              Services &amp; Pricing
            </h3>
            <button
              onClick={() => startTransition(() => navigate("/provider/edit-services-and-pricing"))}
              className="text-[#56C490] text-[14px] font-semibold flex items-center gap-[4px] transition-all active:opacity-70"
            >
              Edit Services &amp; Pricing
              <ChevronRight className="w-[16px] h-[16px]" />
            </button>
          </div>

          {/* Services Grid */}
          <div className="space-y-[12px]">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] p-[16px]"
              >
                <div className="mb-[8px]">
                  <h4 className="text-[#111827] text-[15px] font-semibold mb-[4px]">
                    {service.name}
                  </h4>
                  <p className="text-[#6B7280] text-[13px]">
                    {service.description}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#56C490] text-[18px] font-bold">
                    {formatPeso(service.price)} per hour
                  </span>
                  <span className="text-[#9CA3AF] text-[13px]">
                    {service.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="bg-white px-[24px] py-[20px] mb-[8px]">
          <div className="flex items-center justify-between mb-[16px]">
            <div>
              <h3 className="text-[#111827] text-[16px] font-semibold mb-[2px]">
                Portfolio
              </h3>
              <p className="text-[#6B7280] text-[13px]">
                Showcase your best work
              </p>
            </div>
            <button
              onClick={() => startTransition(() => navigate("/provider/portfolio-management"))}
              className="text-[#56C490] text-[14px] font-semibold flex items-center gap-[4px] transition-all active:opacity-70"
            >
              Manage Portfolio
              <ChevronRight className="w-[16px] h-[16px]" />
            </button>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-2 gap-[12px]">
            {portfolioItems.map((item) => (
              <div
                key={item.id}
                className="aspect-square rounded-[12px] overflow-hidden bg-[#F3F4F6]"
              >
                <img
                  src={item.imageUrl}
                  alt="Portfolio"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Service Areas */}
        <div className="bg-white px-[24px] py-[20px] mb-[8px]">
          <h3 className="text-[#111827] text-[16px] font-semibold mb-[12px]">
            Service Areas
          </h3>
          <div className="flex flex-wrap gap-[8px]">
            <span className="bg-[#F3F4F6] text-[#374151] px-[12px] py-[6px] rounded-[8px] text-[14px] font-medium">
              Metro Manila, Philippines
            </span>
          </div>
        </div>

        {/* Languages Spoken */}
        <div className="bg-white px-[24px] py-[20px]">
          <h3 className="text-[#111827] text-[16px] font-semibold mb-[12px]">
            Languages Spoken
          </h3>
          <div className="flex flex-wrap gap-[8px]">
            <span className="bg-[#E8F5E9] text-[#56C490] px-[12px] py-[6px] rounded-[8px] text-[14px] font-medium">
              English
            </span>
            <span className="bg-[#E8F5E9] text-[#56C490] px-[12px] py-[6px] rounded-[8px] text-[14px] font-medium">
              Filipino
            </span>
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}