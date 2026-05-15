import { useNavigate } from "react-router";
import {
  Search,
  Bell,
  Wrench,
  Sparkles,
  Flower2,
  Briefcase,
  PawPrint,
  PartyPopper,
  Car,
  RotateCcw,
  ChevronRight,
  Settings,
  ArrowRight,
} from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { BottomNavigation } from "../components/BottomNavigation";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { customerServiceHistory } from "../data/customer-service-history";
import { formatPeso } from "../utils/formatPeso";

// ─── Brand colors ───────────────────────────────────────────────
const MINT = "#56C490";
const MINT_DARK = "#3DAE76";
const CREAM = "#FAF8F5";
const CORAL = "#FF8C7A";

// ─── Full 7 Categories ─────────────────────────────────────────
const categories = [
  {
    id: "home-maintenance-repair",
    label: "Home Maintenance & Repair",
    subs: "Plumbing, Electrical, Carpentry, Painting",
    Icon: Wrench,
    color: MINT,
    bg: "#EEF9F3",
  },
  {
    id: "beauty-wellness-personal-care",
    label: "Beauty, Wellness & Personal Care",
    subs: "Hair Styling, Makeup, Massage, Nails",
    Icon: Flower2,
    color: "#E879A8",
    bg: "#FEF0F7",
  },
  {
    id: "education-professional-services",
    label: "Education & Professional Services",
    subs: "Academic Tutor, Language, Music Lessons",
    Icon: Briefcase,
    color: "#7B8FF5",
    bg: "#F0F1FE",
  },
  {
    id: "domestic-cleaning-services",
    label: "Domestic & Cleaning Services",
    subs: "House Cleaning, Laundry, Deep Clean",
    Icon: Sparkles,
    color: "#5AAFF0",
    bg: "#EFF7FE",
  },
  {
    id: "pet-services",
    label: "Pet Services",
    subs: "Grooming, Dog Walking, Pet Sitting",
    Icon: PawPrint,
    color: "#F5A83A",
    bg: "#FEF5E8",
  },
  {
    id: "events-entertainment",
    label: "Events & Entertainment",
    subs: "Photography, Hosting/MC, Catering, DJ",
    Icon: PartyPopper,
    color: CORAL,
    bg: "#FFF0EE",
  },
  {
    id: "automotive-tech-support",
    label: "Automotive & Tech Support",
    subs: "Car Repair, Car Wash, IT/Gadget Repair",
    Icon: Car,
    color: "#9B7FE8",
    bg: "#F4F0FE",
  },
];

// ─── Recent bookings (completed only, most recent first) ───────
const recentBookings = customerServiceHistory
  .filter((s) => s.status === "completed")
  .slice(0, 5);

// ─── Component ─────────────────────────────────────────────────
export default function CustomerHomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: CREAM }} className="w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="flex-shrink-0" style={{ height: 47, backgroundColor: MINT }}>
        <StatusBar />
      </div>

      {/* ── Warm Mint Header ── */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{
          background: `linear-gradient(160deg, #6DD4A6 0%, ${MINT} 60%, ${MINT_DARK} 100%)`,
          paddingTop: 14,
          paddingBottom: 32,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {/* Ambient blobs */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 200,
            height: 200,
            top: -60,
            right: -60,
            background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 140,
            height: 140,
            bottom: -30,
            left: -40,
            background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Greeting Row */}
        <div className="relative z-10 flex items-center justify-between mb-[18px]">
          <div className="flex items-center gap-[10px]">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(8px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="6" r="3" fill="white" />
                <path
                  d="M3.5 16C3.5 12.5 6 10.5 9 10.5C12 10.5 14.5 12.5 14.5 16"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1,
                }}
              >
                Good Afternoon
              </p>
              <p
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "white",
                  lineHeight: 1.25,
                  marginTop: 2,
                }}
              >
                Kisshia
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/customer/notifications")}
            className="relative transition-transform active:scale-90"
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: "rgba(255,255,255,0.22)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <Bell className="w-[20px] h-[20px] text-white" strokeWidth={2.2} />
            {/* Notification dot */}
            <span
              className="absolute top-[9px] right-[10px] rounded-full"
              style={{ width: 8, height: 8, background: CORAL, border: "2px solid rgba(86,196,144,0.8)" }}
            />
          </button>
        </div>

        {/* Search Bar */}
        <button
          onClick={() => navigate("/customer/search-results")}
          className="relative w-full text-left transition-transform active:scale-[0.98]"
        >
          <Search
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: 18, width: 18, height: 18, color: "#9B8E84" }}
            strokeWidth={2.2}
          />
          <div
            style={{
              width: "100%",
              height: 52,
              paddingLeft: 50,
              paddingRight: 20,
              backgroundColor: "white",
              borderRadius: 18,
              fontFamily: "'Nunito', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: "#9B8E84",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 8px 28px rgba(44, 90, 60, 0.12), 0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            Search for services...
          </div>
        </button>
      </div>

      {/* ── Scrollable Body ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* ═══════════════════════════════════════════════════════
            BOOK IT AGAIN — Horizontal Carousel
            ═══════════════════════════════════════════════════════ */}
        <div className="pt-[20px] pb-[4px]">
          <div className="flex items-center justify-between px-[24px] mb-[12px]">
            <div className="flex items-center gap-[7px]">
              <RotateCcw
                className="w-[14px] h-[14px]"
                style={{ color: MINT }}
                strokeWidth={2.5}
              />
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#2C2A28",
                }}
              >
                Book it again
              </span>
            </div>
          </div>

          <div
            className="flex gap-[12px] overflow-x-auto px-[24px] pb-[4px]"
            style={{ scrollbarWidth: "none" }}
          >
            {recentBookings.map((booking) => (
              <button
                key={booking.id}
                onClick={() => navigate("/customer/all-services")}
                className="flex items-center gap-[12px] transition-transform active:scale-[0.96] flex-shrink-0"
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: "12px 16px 12px 12px",
                  minWidth: 250,
                  maxWidth: 270,
                  boxShadow: "0 8px 28px rgba(44, 42, 40, 0.07), 0 2px 8px rgba(44, 42, 40, 0.04)",
                }}
              >
                {/* Provider avatar */}
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: `linear-gradient(145deg, #7DD4A8, ${MINT_DARK})`,
                    boxShadow: "0 4px 12px rgba(86,196,144,0.35)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 18,
                      fontWeight: 800,
                      color: "white",
                    }}
                  >
                    {booking.providerName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p
                    className="truncate"
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#2C2A28",
                      lineHeight: 1.2,
                    }}
                  >
                    {booking.serviceType}
                  </p>
                  <p
                    className="truncate mt-[2px]"
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#9B8E84",
                    }}
                  >
                    {booking.providerName}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <p
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 13,
                      fontWeight: 800,
                      color: MINT_DARK,
                    }}
                  >
                    {formatPeso(booking.amountPaid)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            BROWSE ALL CATEGORIES — Full 7-Category 2-Col Grid
            ═══════════════════════════════════════════════════════ */}
        <div className="px-[24px] pt-[22px] pb-[6px]">
          <h2
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 19,
              fontWeight: 800,
              color: "#2C2A28",
              letterSpacing: -0.3,
            }}
          >
            Browse all categories
          </h2>
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: "#9B8E84",
              marginTop: 3,
            }}
          >
            Find the right service for you
          </p>
        </div>

        <div className="px-[24px] pb-[8px]">
          <div className="grid grid-cols-2 gap-[12px]">
            {categories.map(({ id, label, subs, Icon, color, bg }) => (
              <button
                key={id}
                onClick={() => navigate(`/customer/category/${id}`)}
                className="flex flex-col text-left transition-transform active:scale-[0.96]"
                style={{
                  backgroundColor: "white",
                  borderRadius: 22,
                  padding: 16,
                  boxShadow: "0 8px 28px rgba(44, 42, 40, 0.07), 0 2px 8px rgba(44, 42, 40, 0.04)",
                }}
              >
                {/* Icon */}
                <div
                  className="flex items-center justify-center mb-[12px]"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor: bg,
                  }}
                >
                  <Icon
                    style={{ width: 24, height: 24, color }}
                    strokeWidth={2.2}
                  />
                </div>

                {/* Label */}
                <p
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#2C2A28",
                    lineHeight: 1.35,
                    marginBottom: 5,
                  }}
                >
                  {label}
                </p>

                {/* Sub-services */}
                <p
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#9B8E84",
                    lineHeight: 1.45,
                  }}
                >
                  {subs}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            MORE ABOUT SERVEASE — Branded Section
            ═══════════════════════════════════════════════════════ */}
        <div className="px-[24px] pt-[18px] pb-[6px]">
          <h2
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 19,
              fontWeight: 800,
              color: "#2C2A28",
              letterSpacing: -0.3,
            }}
          >
            More About ServEase
          </h2>
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: "#9B8E84",
              marginTop: 3,
            }}
          >
            Your reliable partner for every service need.
          </p>
        </div>

        {/* ── Provider Recruitment Card ── */}
        <div className="px-[24px] pb-[24px] pt-[10px]">
          <button
            onClick={() => navigate("/provider/info")}
            className="w-full text-left transition-transform active:scale-[0.98] overflow-hidden"
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              boxShadow: "0 12px 40px rgba(44, 42, 40, 0.09), 0 4px 12px rgba(44, 42, 40, 0.05)",
            }}
          >
            {/* Card Image */}
            <div className="relative w-full overflow-hidden" style={{ height: 148 }}>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1598724168411-9ba1e003a7fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxGaWxpcGlubyUyMGhhbmR5bWFuJTIwc2tpbGxlZCUyMHdvcmtlciUyMHRvb2xzfGVufDF8fHx8MTc3MzQ4OTYyOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Become a ServEase provider"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(30,60,40,0.55) 0%, rgba(30,60,40,0.1) 50%, transparent 100%)" }} />

              {/* Floating badge */}
              <div
                className="absolute flex items-center justify-center"
                style={{
                  top: 12,
                  right: 12,
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  background: `linear-gradient(145deg, #7DD4A8, ${MINT_DARK})`,
                  boxShadow: "0 6px 16px rgba(86,196,144,0.45)",
                }}
              >
                <Settings className="w-[18px] h-[18px] text-white" strokeWidth={2.2} />
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: "16px 18px 18px" }}>
              <div className="flex items-start justify-between gap-[12px]">
                <div className="flex-1">
                  <h3
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#2C2A28",
                      lineHeight: 1.3,
                      marginBottom: 6,
                    }}
                  >
                    Join the ServEase Team
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#9B8E84",
                      lineHeight: 1.55,
                    }}
                  >
                    Turn your skills into earnings. Become a verified Service Provider today.
                  </p>
                </div>
                <ChevronRight className="w-[18px] h-[18px] flex-shrink-0 mt-[2px]" style={{ color: "#9B8E84" }} />
              </div>

              {/* Pill CTA */}
              <div
                className="mt-[16px] flex items-center justify-center gap-[8px]"
                style={{
                  height: 46,
                  borderRadius: 100,
                  background: `linear-gradient(135deg, #6DD4A6, ${MINT_DARK})`,
                  boxShadow: "0 8px 24px rgba(86,196,144,0.38)",
                }}
              >
                <ArrowRight className="w-[16px] h-[16px] text-white" strokeWidth={2.5} />
                <span
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "white",
                  }}
                >
                  Get Started
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Bottom spacer for nav */}
        <div className="h-[90px]" />
      </div>

      {/* ── Bottom Navigation ── */}
      <BottomNavigation />

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
