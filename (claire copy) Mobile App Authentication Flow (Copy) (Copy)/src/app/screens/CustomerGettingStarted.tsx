import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, ChevronRight, UserPlus, Search, Calendar, MessageCircle, CreditCard, Star, MapPin, Bell } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

export default function CustomerGettingStarted() {
  const navigate = useNavigate();

  const helpArticles = [
    {
      id: 1,
      icon: UserPlus,
      iconColor: "#56C490",
      iconBg: "#56C490",
      title: "How to Create an Account",
      description: "Step-by-step guide to signing up and setting up your ServEase profile",
      content: "Learn how to register, verify your phone number, and complete your profile setup"
    },
    {
      id: 2,
      icon: Calendar,
      iconColor: "#3B82F6",
      iconBg: "#3B82F6",
      title: "How to Book a Service",
      description: "Complete guide to booking your first service on ServEase",
      content: "From selecting a service to confirming your booking and payment"
    },
    {
      id: 3,
      icon: Search,
      iconColor: "#F59E0B",
      iconBg: "#F59E0B",
      title: "How to Search for Services",
      description: "Tips for finding the right service providers in your area",
      content: "Use filters, search by location, and browse categories effectively"
    },
    {
      id: 4,
      icon: MessageCircle,
      iconColor: "#8B5CF6",
      iconBg: "#8B5CF6",
      title: "How to Contact Service Providers",
      description: "Ways to communicate with providers before and during service",
      content: "Chat, call, and message your service provider directly through the app"
    },
    {
      id: 5,
      icon: CreditCard,
      iconColor: "#EC4899",
      iconBg: "#EC4899",
      title: "Setting Up Payment Methods",
      description: "Add and manage your payment options for quick checkout",
      content: "Link credit cards, debit cards, and digital wallets securely"
    },
    {
      id: 6,
      icon: Star,
      iconColor: "#FFC107",
      iconBg: "#FFC107",
      title: "How to Rate and Review Services",
      description: "Share your experience and help other customers make decisions",
      content: "Leave ratings, write reviews, and upload photos of completed work"
    },
    {
      id: 7,
      icon: MapPin,
      iconColor: "#EF4444",
      iconBg: "#EF4444",
      title: "Adding Service Locations",
      description: "Save addresses for faster booking and service delivery",
      content: "Add home, office, and other frequently used locations"
    },
    {
      id: 8,
      icon: Bell,
      iconColor: "#10B981",
      iconBg: "#10B981",
      title: "Managing Notifications",
      description: "Stay updated on bookings, messages, and special offers",
      content: "Customize your notification preferences for important updates"
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
          Getting Started
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        <div className="px-[24px] py-[20px]">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-[#56C490] to-[#00a055] rounded-[16px] p-[20px] mb-[24px]">
            <h2 className="font-['Nunito',sans-serif] text-[20px] text-white mb-[8px]">
              Welcome to ServEase! 👋
            </h2>
            <p className="font-['Nunito',sans-serif] text-[14px] text-white/90 leading-[1.5]">
              We're here to help you get started. Browse these guides to learn how to make the most of ServEase and book your first service.
            </p>
          </div>

          {/* Help Articles */}
          <div className="mb-[24px]">
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
              Beginner Guides
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

          {/* Quick Tips */}
          <div className="bg-[#F9FAFB] rounded-[16px] p-[20px] border border-[#E5E7EB]">
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[12px]">
              Quick Tips 💡
            </h3>
            <ul className="space-y-[8px]">
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Complete your profile to get personalized service recommendations
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Add a payment method before booking to speed up checkout
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Read reviews and ratings to find the best service providers
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Enable notifications to stay updated on your bookings
                </p>
              </li>
            </ul>
          </div>

          {/* Still Need Help Section */}
          <div className="mt-[24px] text-center">
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[12px]">
              Still need help?
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
