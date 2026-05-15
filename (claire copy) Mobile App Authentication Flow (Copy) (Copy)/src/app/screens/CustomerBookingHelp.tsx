import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, ChevronRight, Calendar, Edit3, XCircle, Clock, CheckCircle, AlertCircle, RefreshCw, FileText, DollarSign, MapPin, MessageSquare } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

export default function CustomerBookingHelp() {
  const navigate = useNavigate();

  const helpArticles = [
    {
      id: 1,
      icon: Calendar,
      iconColor: "#56C490",
      iconBg: "#56C490",
      title: "How to Book a Service",
      description: "Learn the step-by-step process of booking a service provider on ServEase",
      content: "From browsing services to confirming your booking and making payment"
    },
    {
      id: 2,
      icon: Edit3,
      iconColor: "#3B82F6",
      iconBg: "#3B82F6",
      title: "How to Reschedule a Booking",
      description: "Change the date or time of your scheduled service appointment",
      content: "Modify your booking details and get confirmation from the provider"
    },
    {
      id: 3,
      icon: XCircle,
      iconColor: "#EF4444",
      iconBg: "#EF4444",
      title: "How to Cancel a Booking",
      description: "Cancel your service booking and understand the refund policy",
      content: "Learn about cancellation timeframes, refund eligibility, and fees"
    },
    {
      id: 4,
      icon: Clock,
      iconColor: "#F59E0B",
      iconBg: "#F59E0B",
      title: "Understanding Booking Status Updates",
      description: "Track your service request from pending to completed",
      content: "Learn what each booking status means: Pending, Accepted, In Progress, Completed"
    },
    {
      id: 5,
      icon: CheckCircle,
      iconColor: "#10B981",
      iconBg: "#10B981",
      title: "Confirming Service Completion",
      description: "How to verify and confirm that your service has been completed",
      content: "Review work quality, upload photos, and mark service as done"
    },
    {
      id: 6,
      icon: AlertCircle,
      iconColor: "#EF4444",
      iconBg: "#EF4444",
      title: "What If Provider Doesn't Show Up",
      description: "Steps to take when your service provider fails to arrive",
      content: "Contact provider, report no-show, and request refund or rebooking"
    },
    {
      id: 7,
      icon: RefreshCw,
      iconColor: "#8B5CF6",
      iconBg: "#8B5CF6",
      title: "Rebooking After Cancellation",
      description: "How to book the same service again after a cancelled appointment",
      content: "Find the same provider or select a new one for your service needs"
    },
    {
      id: 8,
      icon: FileText,
      iconColor: "#06B6D4",
      iconBg: "#06B6D4",
      title: "Viewing Booking Details",
      description: "Access complete information about your current and past bookings",
      content: "See service details, provider info, pricing, and booking history"
    },
    {
      id: 9,
      icon: DollarSign,
      iconColor: "#EC4899",
      iconBg: "#EC4899",
      title: "Additional Payment Requests",
      description: "Understand when and why providers may request additional payment",
      content: "Handle extra charges for materials, extended time, or scope changes"
    },
    {
      id: 10,
      icon: MapPin,
      iconColor: "#F97316",
      iconBg: "#F97316",
      title: "Changing Service Location",
      description: "Update the address where the service will be performed",
      content: "Modify location details before provider arrives at your location"
    },
    {
      id: 11,
      icon: MessageSquare,
      iconColor: "#14B8A6",
      iconBg: "#14B8A6",
      title: "Communicating with Provider About Bookings",
      description: "Best practices for discussing booking details with your provider",
      content: "Send messages, share photos, and clarify service requirements"
    },
    {
      id: 12,
      icon: Calendar,
      iconColor: "#A855F7",
      iconBg: "#A855F7",
      title: "Booking Multiple Services at Once",
      description: "How to schedule different services from various providers",
      content: "Coordinate multiple bookings and manage your service calendar"
    }
  ];

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] py-[12px] flex items-center gap-[16px] border-b border-[#F2F2F2] flex-shrink-0">
        <button
          onClick={() => navigate("/customer/help")}
          className="w-[40px] h-[40px] flex items-center justify-center -ml-[8px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
        </button>
        <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
          Booking Help
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        <div className="px-[24px] py-[20px]">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-[16px] p-[20px] mb-[24px]">
            <h2 className="font-['Nunito',sans-serif] text-[20px] text-white mb-[8px]">
              Booking Services Made Easy 📅
            </h2>
            <p className="font-['Nunito',sans-serif] text-[14px] text-white/90 leading-[1.5]">
              Everything you need to know about creating, managing, and completing service bookings on ServEase.
            </p>
          </div>

          {/* Help Articles */}
          <div className="mb-[24px]">
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
              Booking Guides
            </h3>
            
            <div className="space-y-[12px]">
              {helpArticles.map((article) => {
                const Icon = article.icon;
                return (
                  <button
                    key={article.id}
                    onClick={() => {
                      // In production, this would navigate to the full article page
                      console.log("Opening article:", article.title);
                    }}
                    className="w-full bg-white rounded-[16px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#F2F2F2] transition-all active:scale-[0.98] hover:shadow-[0_4px_12px_rgba(86,196,144,0.15)] hover:border-[#56C490]/30"
                  >
                    <div className="flex items-start gap-[12px]">
                      {/* Icon */}
                      <div 
                        className="flex-shrink-0 w-[48px] h-[48px] rounded-[12px] flex items-center justify-center"
                        style={{ backgroundColor: `${article.iconBg}15` }}
                      >
                        <Icon 
                          className="w-[24px] h-[24px]" 
                          style={{ color: article.iconColor }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left">
                        <h4 className="font-['Nunito',sans-serif] text-[15px] text-[#111827] mb-[4px] leading-[1.3]">
                          {article.title}
                        </h4>
                        <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.4] mb-[6px]">
                          {article.description}
                        </p>
                        <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] leading-[1.4]">
                          {article.content}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0 self-center">
                        <div className="w-[32px] h-[32px] rounded-full bg-[#F9FAFB] flex items-center justify-center">
                          <ChevronRight className="w-[18px] h-[18px] text-[#6B7280]" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Booking Tips */}
          <div className="bg-[#F9FAFB] rounded-[16px] p-[20px] border border-[#E5E7EB]">
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[12px]">
              Booking Tips 💡
            </h3>
            <ul className="space-y-[8px]">
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Book in advance during peak hours to ensure provider availability
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Check provider ratings and reviews before confirming your booking
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Provide clear service details to avoid miscommunication
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Cancel at least 24 hours in advance to avoid cancellation fees
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Enable notifications to receive updates about your bookings
                </p>
              </li>
            </ul>
          </div>

          {/* Still Need Help Section */}
          <div className="mt-[24px] text-center">
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[12px]">
              Still have questions about bookings?
            </p>
            <button
              onClick={() => navigate("/customer/help")}
              className="font-['Nunito',sans-serif] text-[14px] text-[#56C490] transition-all active:scale-95"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
