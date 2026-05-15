import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { Check, Search, ShieldCheck, MapPin } from "lucide-react";
import { useOnboarding } from "../contexts/OnboardingContext";

// ─── Confetti Particle ─────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  angle: number;
  distance: number;
  shape: "circle" | "square" | "star";
  rotation: number;
}

const CONFETTI_COLORS = [
  "#56C490",
  "#00D46E",
  "#34D399",
  "#6EE7B7",
  "#FCD34D",
  "#FBBF24",
  "#F59E0B",
  "#A78BFA",
  "#818CF8",
  "#60A5FA",
  "#FB923C",
  "#F87171",
  "#FF6B9D",
];

const SHAPES: Particle["shape"][] = ["circle", "square", "star"];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 20,
    y: 38 + (Math.random() - 0.5) * 10,
    size: Math.random() * 6 + 3,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 0.6,
    duration: Math.random() * 1.2 + 1.2,
    angle: Math.random() * 360,
    distance: Math.random() * 160 + 80,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    rotation: Math.random() * 720 - 360,
  }));
}

// ─── Component ─────────────────────────────────────────────────
export default function CustomerOnboardingComplete() {
  const navigate = useNavigate();
  const { userProfile, completeOnboarding } = useOnboarding();
  const [showContent, setShowContent] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  const particles = useMemo(() => generateParticles(50), []);

  // Staged reveal
  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 400);
    const t2 = setTimeout(() => setShowChecklist(true), 900);
    const t3 = setTimeout(() => setShowCTA(true), 1300);

    // Mark onboarding as complete
    completeOnboarding();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Auto-redirect after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/customer/home", { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoHome = useCallback(() => {
    navigate("/customer/home", { replace: true });
  }, [navigate]);

  // Derive first name from profile, fallback to "there"
  const firstName = userProfile.fullName
    ? userProfile.fullName.split(" ")[0]
    : "there";

  return (
    <div className="bg-white w-full h-screen flex flex-col relative overflow-hidden">
      {/* iOS Status Bar */}
      <div className="flex-shrink-0">
        <StatusBar />
      </div>

      {/* ── Radiating Circles Background ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3, 4].map((ring) => (
          <div
            key={ring}
            className="absolute rounded-full border border-[#56C490]"
            style={{
              width: `${ring * 120 + 60}px`,
              height: `${ring * 120 + 60}px`,
              opacity: 0,
              animation: `radiateRing 2.4s ease-out ${
                ring * 0.15
              }s forwards`,
            }}
          />
        ))}
      </div>

      {/* ── Confetti Burst ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor:
                p.shape !== "star" ? p.color : "transparent",
              borderRadius: p.shape === "circle" ? "50%" : "2px",
              ...(p.shape === "star"
                ? {
                    clipPath:
                      "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                    backgroundColor: p.color,
                  }
                : {}),
              opacity: 0,
              animation: `confettiBurst ${p.duration}s ease-out ${p.delay}s forwards`,
              transform: `translate(-50%, -50%)`,
              ["--angle" as string]: `${p.angle}deg`,
              ["--distance" as string]: `${p.distance}px`,
              ["--rotation" as string]: `${p.rotation}deg`,
            }}
          />
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-[24px]">
        {/* Checkmark */}
        <div
          className="mb-[28px]"
          style={{
            opacity: 0,
            animation: "checkmarkPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards",
          }}
        >
          <div className="relative">
            {/* Glow ring */}
            <div
              className="absolute inset-[-10px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(86,196,144,0.2) 0%, transparent 70%)",
                animation: "glowPulse 2s ease-in-out infinite",
              }}
            />
            <div className="w-[96px] h-[96px] bg-[#56C490] rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(86,196,144,0.4)] relative">
              <Check
                className="w-[48px] h-[48px] text-white"
                strokeWidth={3}
              />
            </div>
          </div>
        </div>

        {/* Headline & Body */}
        <div
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent
              ? "translateY(0)"
              : "translateY(16px)",
            transition: "all 0.5s ease-out",
          }}
        >
          <h1 className="font-['Nunito',sans-serif] text-[26px] text-[#111827] text-center tracking-[-0.5px] leading-[1.2] mb-[12px]">
            You're All Set, {firstName}!
          </h1>
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] text-center leading-[1.6] max-w-[320px] mx-auto">
            Your profile is 100% complete. You can now book reliable
            independent services, track your providers in real-time, and
            manage everything in one place.
          </p>
        </div>

        {/* ── What's Next Checklist ── */}
        <div
          className="w-full mt-[32px] max-w-[340px]"
          style={{
            opacity: showChecklist ? 1 : 0,
            transform: showChecklist
              ? "translateY(0)"
              : "translateY(20px)",
            transition: "all 0.5s ease-out",
          }}
        >
          <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF] tracking-[0.8px] mb-[14px] text-center">
            WHAT'S NEXT
          </p>
          <div className="bg-[#F9FAFB] rounded-[18px] p-[20px] border border-[#F3F4F6] space-y-[14px]">
            {[
              {
                icon: Search,
                text: "Browse 7+ Service Categories",
                delay: 0,
              },
              {
                icon: ShieldCheck,
                text: "Secure Payments Enabled",
                delay: 150,
              },
              {
                icon: MapPin,
                text: "Real-time Tracking Ready",
                delay: 300,
              },
            ].map((item, idx) => (
              <div
                key={item.text}
                className="flex items-center gap-[14px]"
                style={{
                  opacity: showChecklist ? 1 : 0,
                  transform: showChecklist
                    ? "translateX(0)"
                    : "translateX(-12px)",
                  transition: `all 0.4s ease-out ${
                    item.delay + 200
                  }ms`,
                }}
              >
                <div className="w-[36px] h-[36px] rounded-[10px] bg-[#ECFDF5] flex items-center justify-center flex-shrink-0">
                  <item.icon
                    className="w-[16px] h-[16px] text-[#56C490]"
                    strokeWidth={2}
                  />
                </div>
                <div className="flex items-center gap-[8px] flex-1">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#56C490] flex items-center justify-center flex-shrink-0">
                    <Check
                      className="w-[10px] h-[10px] text-white"
                      strokeWidth={3}
                    />
                  </div>
                  <p className="font-['Nunito',sans-serif] text-[13px] text-[#374151]">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div
        className="relative z-10 px-[24px] pb-[12px]"
        style={{
          opacity: showCTA ? 1 : 0,
          transform: showCTA ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.5s ease-out",
        }}
      >
        {/* Three-dot loading animation */}
        <div className="flex items-center justify-center gap-[6px] mb-[16px]">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              className="w-[6px] h-[6px] rounded-full bg-[#56C490]"
              style={{
                animation: `dotPulse 1.2s ease-in-out ${
                  dot * 0.2
                }s infinite`,
              }}
            />
          ))}
        </div>

        <button
          onClick={handleGoHome}
          className="w-full h-[54px] bg-[#56C490] rounded-[50px] flex items-center justify-center transition-all active:scale-[0.97] shadow-[0_6px_20px_rgba(86,196,144,0.35)]"
        >
          <span className="font-['Nunito',sans-serif] text-[16px] text-white">
            Take me to Home
          </span>
        </button>

        <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF] text-center mt-[10px]">
          Auto-redirecting shortly…
        </p>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes checkmarkPop {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        @keyframes radiateRing {
          0% {
            opacity: 0.35;
            transform: scale(0.3);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }

        @keyframes confettiBurst {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(0deg) translateY(0px);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%)
              rotate(var(--rotation))
              translate(
                calc(cos(var(--angle)) * var(--distance)),
                calc(sin(var(--angle)) * var(--distance))
              );
          }
        }

        @keyframes dotPulse {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}