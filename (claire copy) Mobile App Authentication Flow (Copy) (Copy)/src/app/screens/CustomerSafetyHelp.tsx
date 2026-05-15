import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, ChevronRight, Shield, AlertTriangle, UserCheck, Phone, AlertCircle, Eye, MapPin, Lock, Users, FileText, MessageSquare, Camera } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

export default function CustomerSafetyHelp() {
  const navigate = useNavigate();

  const helpArticles = [
    {
      id: 1,
      icon: Users,
      iconColor: "#EF4444",
      iconBg: "#EF4444",
      title: "Safety Tips When Meeting Service Providers",
      description: "Essential guidelines to stay safe during service appointments",
      content: "Best practices for in-person meetings, location safety, and personal precautions"
    },
    {
      id: 2,
      icon: AlertTriangle,
      iconColor: "#F59E0B",
      iconBg: "#F59E0B",
      title: "Reporting Suspicious Behavior",
      description: "How to report concerning activities or inappropriate conduct",
      content: "Learn what to report, how to report, and what happens after you submit a report"
    },
    {
      id: 3,
      icon: UserCheck,
      iconColor: "#56C490",
      iconBg: "#56C490",
      title: "How ServEase Verifies Service Providers",
      description: "Understanding our provider screening and verification process",
      content: "Background checks, ID verification, skill assessment, and ongoing monitoring"
    },
    {
      id: 4,
      icon: Phone,
      iconColor: "#EF4444",
      iconBg: "#EF4444",
      title: "Emergency Contact Guidance",
      description: "What to do in case of emergencies during service appointments",
      content: "Emergency hotlines, in-app panic button, and safety protocols"
    },
    {
      id: 5,
      icon: Shield,
      iconColor: "#3B82F6",
      iconBg: "#3B82F6",
      title: "ServEase Safety Guarantee",
      description: "Our commitment to your safety and security on the platform",
      content: "Insurance coverage, incident support, and customer protection policies"
    },
    {
      id: 6,
      icon: Eye,
      iconColor: "#8B5CF6",
      iconBg: "#8B5CF6",
      title: "Protecting Your Privacy",
      description: "How to keep your personal information secure",
      content: "Privacy settings, data sharing guidelines, and communication safety"
    },
    {
      id: 7,
      icon: MapPin,
      iconColor: "#EC4899",
      iconBg: "#EC4899",
      title: "Safe Location Practices",
      description: "Choosing secure locations for service appointments",
      content: "Public vs. private locations, sharing your location, and venue safety tips"
    },
    {
      id: 8,
      icon: Lock,
      iconColor: "#10B981",
      iconBg: "#10B981",
      title: "Account Security Best Practices",
      description: "Protecting your ServEase account from unauthorized access",
      content: "Strong passwords, two-factor authentication, and recognizing phishing attempts"
    },
    {
      id: 9,
      icon: MessageSquare,
      iconColor: "#06B6D4",
      iconBg: "#06B6D4",
      title: "Safe Communication Guidelines",
      description: "Best practices for messaging service providers",
      content: "Keep conversations on-platform, avoid sharing sensitive info, and report harassment"
    },
    {
      id: 10,
      icon: Camera,
      iconColor: "#F97316",
      iconBg: "#F97316",
      title: "Photo and Video Safety",
      description: "Guidelines for sharing images during service bookings",
      content: "What's safe to share, privacy concerns, and protecting your home details"
    },
    {
      id: 11,
      icon: FileText,
      iconColor: "#14B8A6",
      iconBg: "#14B8A6",
      title: "Reading Provider Ratings and Reviews",
      description: "How to evaluate providers using ratings and customer feedback",
      content: "Identifying red flags, verifying reviews, and making informed decisions"
    },
    {
      id: 12,
      icon: AlertCircle,
      iconColor: "#A855F7",
      iconBg: "#A855F7",
      title: "Safety Red Flags to Watch For",
      description: "Warning signs of potentially unsafe situations or scams",
      content: "Recognizing suspicious requests, off-platform payments, and unsafe behavior"
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
          Safety Help
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        <div className="px-[24px] py-[20px]">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-[#EF4444] to-[#DC2626] rounded-[16px] p-[20px] mb-[24px]">
            <h2 className="font-['Nunito',sans-serif] text-[20px] text-white mb-[8px]">
              Your Safety Matters 🛡️
            </h2>
            <p className="font-['Nunito',sans-serif] text-[14px] text-white/90 leading-[1.5]">
              Learn how to stay safe while using ServEase, report concerns, and understand our safety protocols and provider verification process.
            </p>
          </div>

          {/* Help Articles */}
          <div className="mb-[24px]">
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
              Safety Guides
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

          {/* Quick Safety Reminders */}
          <div className="bg-[#FEF2F2] rounded-[16px] p-[20px] border border-[#FEE2E2] mb-[24px]">
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[12px] flex items-center gap-[8px]">
              <Shield className="w-[20px] h-[20px] text-[#EF4444]" />
              Quick Safety Reminders
            </h3>
            <ul className="space-y-[8px]">
              <li className="flex items-start gap-[8px]">
                <span className="text-[#EF4444] mt-[2px]">⚠️</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Always verify provider identity before letting them into your home
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#EF4444] mt-[2px]">⚠️</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Keep all communication and payments within the ServEase app
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#EF4444] mt-[2px]">⚠️</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Trust your instincts - cancel if something feels wrong
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#EF4444] mt-[2px]">⚠️</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Report suspicious behavior immediately to our safety team
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#EF4444] mt-[2px]">⚠️</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Share your booking details with a trusted friend or family member
                </p>
              </li>
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-gradient-to-br from-[#DC2626] to-[#B91C1C] rounded-[16px] p-[20px] mb-[24px]">
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-white mb-[12px] flex items-center gap-[8px]">
              <Phone className="w-[20px] h-[20px] text-white" />
              Emergency Contacts
            </h3>
            <div className="space-y-[8px]">
              <div className="bg-white/10 rounded-[8px] p-[12px]">
                <p className="font-['Nunito',sans-serif] text-[13px] text-white mb-[2px]">
                  ServEase Safety Hotline
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-white">
                  +63 917 SAFE 247 (7233 247)
                </p>
              </div>
              <div className="bg-white/10 rounded-[8px] p-[12px]">
                <p className="font-['Nunito',sans-serif] text-[13px] text-white mb-[2px]">
                  Philippine Emergency Number
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-white">
                  911
                </p>
              </div>
              <div className="bg-white/10 rounded-[8px] p-[12px]">
                <p className="font-['Nunito',sans-serif] text-[13px] text-white mb-[2px]">
                  National Emergency Hotline
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-white">
                  8888 (Citizen's Complaint Hotline)
                </p>
              </div>
            </div>
          </div>

          {/* Still Need Help Section */}
          <div className="text-center">
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[12px]">
              Have safety concerns or questions?
            </p>
            <button
              onClick={() => navigate("/customer/help")}
              className="font-['Nunito',sans-serif] text-[14px] text-[#56C490] transition-all active:scale-95"
            >
              Contact Safety Team
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
