import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ChevronLeft, Filter, Search, CheckCircle, XCircle, Clock, Home, Calendar, MessageCircle, MoreHorizontal } from "lucide-react";

export default function ProviderServiceHistory() {
  const navigate = useNavigate();
  const [activeTab] = useState("more");
  const [filterStatus, setFilterStatus] = useState("all");

  const bookings = [
    {
      id: "BK-45231",
      date: "Mar 10, 2026",
      customer: "Maria Santos",
      service: "House Cleaning",
      location: "Quezon City",
      amount: 2500,
      fee: 375,
      net: 2325,
      status: "completed",
      rating: 5,
    },
    {
      id: "BK-45198",
      date: "Mar 9, 2026",
      customer: "Juan dela Cruz",
      service: "Plumbing Repair",
      location: "Makati City",
      amount: 1800,
      fee: 270,
      net: 1530,
      status: "completed",
      rating: 4,
    },
    {
      id: "BK-45142",
      date: "Mar 8, 2026",
      customer: "Anna Reyes",
      service: "Electrical Work",
      location: "Taguig City",
      amount: 3200,
      fee: 480,
      net: 3020,
      status: "completed",
      rating: 5,
    },
    {
      id: "BK-45089",
      date: "Mar 7, 2026",
      customer: "Pedro Garcia",
      service: "Aircon Cleaning",
      location: "Pasig City",
      amount: 1500,
      fee: 225,
      net: 1425,
      status: "completed",
      rating: 5,
    },
    {
      id: "BK-45021",
      date: "Mar 6, 2026",
      customer: "Lisa Tan",
      service: "Home Cleaning",
      location: "Mandaluyong",
      amount: 2200,
      fee: 330,
      net: 0,
      status: "cancelled",
      rating: null,
    },
    {
      id: "BK-44987",
      date: "Mar 5, 2026",
      customer: "Robert Cruz",
      service: "Painting Services",
      location: "Quezon City",
      amount: 4500,
      fee: 675,
      net: 4325,
      status: "completed",
      rating: 4,
    },
    {
      id: "BK-44921",
      date: "Mar 4, 2026",
      customer: "Grace Lim",
      service: "Garden Landscaping",
      location: "Paranaque City",
      amount: 3500,
      fee: 525,
      net: 2975,
      status: "completed",
      rating: 5,
    },
    {
      id: "BK-44856",
      date: "Mar 3, 2026",
      customer: "Michael Torres",
      service: "Carpentry Work",
      location: "Manila City",
      amount: 2800,
      fee: 420,
      net: 2380,
      status: "completed",
      rating: 4,
    },
    {
      id: "BK-44789",
      date: "Mar 2, 2026",
      customer: "Sofia Mendoza",
      service: "Deep Cleaning",
      location: "Quezon City",
      amount: 3000,
      fee: 450,
      net: 2550,
      status: "completed",
      rating: 5,
    },
    {
      id: "BK-44723",
      date: "Mar 1, 2026",
      customer: "Carlos Rodriguez",
      service: "Appliance Repair",
      location: "Marikina City",
      amount: 1600,
      fee: 240,
      net: 1360,
      status: "completed",
      rating: 4,
    },
    {
      id: "BK-44665",
      date: "Feb 28, 2026",
      customer: "Diana Cruz",
      service: "Pest Control",
      location: "Pasay City",
      amount: 2100,
      fee: 315,
      net: 1785,
      status: "completed",
      rating: 5,
    },
  ];

  // Calculate dynamic stats from bookings
  const completedBookings = bookings.filter(b => b.status === "completed");
  const totalJobs = completedBookings.length;
  const totalEarned = completedBookings.reduce((sum, b) => sum + b.net, 0);
  const avgRating = completedBookings.length > 0 
    ? (completedBookings.reduce((sum, b) => sum + (b.rating || 0), 0) / completedBookings.length).toFixed(1)
    : "0.0";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <div className="flex items-center gap-[6px] px-[10px] py-[4px] rounded-[6px] bg-[#00C16A]/10">
            <CheckCircle className="w-[14px] h-[14px] text-[#00C16A]" />
            <span className="font-['Nunito',sans-serif] text-[11px] text-[#00C16A]">
              Completed
            </span>
          </div>
        );
      case "cancelled":
        return (
          <div className="flex items-center gap-[6px] px-[10px] py-[4px] rounded-[6px] bg-[#EF4444]/10">
            <XCircle className="w-[14px] h-[14px] text-[#EF4444]" />
            <span className="font-['Nunito',sans-serif] text-[11px] text-[#EF4444]">
              Cancelled
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex gap-[2px]">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? "text-[#FFA500]" : "text-[#E5E7EB]"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#F8F8F8] w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#00C16A] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] pt-[16px] pb-[16px] border-b border-[#E5E7EB] flex-shrink-0">
        <div className="flex items-center gap-[16px] mb-[16px]">
          <button
            onClick={() => navigate(-1)}
            className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all active:scale-90"
          >
            <ChevronLeft className="w-[24px] h-[24px] text-[#111827]" />
          </button>
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Service History
          </h1>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-[12px]">
          <div className="flex-1 relative">
            <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="w-full h-[40px] pl-[40px] pr-[12px] rounded-[10px] bg-[#F3F4F6] border border-[#E5E7EB] font-['Poppins',sans-serif] text-[13px] text-[#111827] outline-none focus:border-[#00C16A] placeholder:text-[#9CA3AF]"
            />
          </div>
          <button className="w-[40px] h-[40px] rounded-[10px] bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center">
            <Filter className="w-[18px] h-[18px] text-[#6B7280]" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-scroll pb-[24px]" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="pt-[16px] px-[16px]">
          {/* Stats Summary */}
          <div className="bg-white px-[24px] py-[16px] mb-[16px] rounded-[12px]">
            <div className="grid grid-cols-3 gap-[12px]">
              <div className="text-center">
                <p className="font-['Nunito',sans-serif] text-[20px] text-[#111827]">
                  {totalJobs}
                </p>
                <p className="font-['Poppins',sans-serif] text-[12px] text-[#6B7280]">
                  Total Jobs
                </p>
              </div>
              <div className="text-center border-l border-r border-[#E5E7EB]">
                <p className="font-['Nunito',sans-serif] text-[20px] text-[#00C16A]">
                  ₱{totalEarned.toLocaleString()}
                </p>
                <p className="font-['Poppins',sans-serif] text-[12px] text-[#6B7280]">
                  Total Earned
                </p>
              </div>
              <div className="text-center">
                <p className="font-['Nunito',sans-serif] text-[20px] text-[#111827]">
                  {avgRating}
                </p>
                <p className="font-['Poppins',sans-serif] text-[#6B7280]">
                  Avg Rating
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-[12px]">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-[16px] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-start justify-between mb-[12px]">
                  <div className="flex-1">
                    <div className="flex items-center gap-[8px] mb-[4px]">
                      <h3 className="font-['Nunito',sans-serif] text-[15px] text-[#111827]">
                        {booking.service}
                      </h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="font-['Poppins',sans-serif] text-[12px] text-[#6B7280]">
                      {booking.id} • {booking.date}
                    </p>
                  </div>
                </div>

                <div className="space-y-[8px] mb-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="font-['Poppins',sans-serif] text-[13px] text-[#6B7280]">
                      Customer:
                    </span>
                    <span className="font-['Nunito',sans-serif] text-[13px] text-[#111827]">
                      {booking.customer}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-['Poppins',sans-serif] text-[13px] text-[#6B7280]">
                      Location:
                    </span>
                    <span className="font-['Nunito',sans-serif] text-[13px] text-[#111827]">
                      {booking.location}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#E5E7EB] pt-[12px]">
                  <div className="flex items-center justify-between mb-[8px]">
                    <span className="font-['Poppins',sans-serif] text-[13px] text-[#6B7280]">
                      Service Charge:
                    </span>
                    <span className="font-['Nunito',sans-serif] text-[13px] text-[#111827]">
                      ₱{booking.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-[8px]">
                    <span className="font-['Poppins',sans-serif] text-[13px] text-[#6B7280]">
                      Platform Fee:
                    </span>
                    <span className="font-['Nunito',sans-serif] text-[13px] text-[#EF4444]">
                      -₱{booking.fee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-[8px] border-t border-[#E5E7EB]">
                    <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                      Net Earnings:
                    </span>
                    <span className="font-['Nunito',sans-serif] text-[16px] text-[#00C16A]">
                      ₱{booking.net.toLocaleString()}
                    </span>
                  </div>
                </div>

                {booking.rating && (
                  <div className="mt-[12px] pt-[12px] border-t border-[#E5E7EB] flex items-center justify-between">
                    <span className="font-['Poppins',sans-serif] text-[13px] text-[#6B7280]">
                      Customer Rating:
                    </span>
                    {renderStars(booking.rating)}
                  </div>
                )}
              </div>
            ))}
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