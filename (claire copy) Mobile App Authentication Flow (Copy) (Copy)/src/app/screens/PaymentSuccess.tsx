import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";

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
  "#F472B6",
  "#FB923C",
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 0,
    y: 0,
    size: 4 + Math.random() * 6,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 0.6,
    duration: 0.8 + Math.random() * 0.8,
    angle: (360 / count) * i + (Math.random() - 0.5) * 30,
    distance: 60 + Math.random() * 80,
    shape: (["circle", "square", "star"] as const)[
      Math.floor(Math.random() * 3)
    ],
    rotation: Math.random() * 360,
  }));
}

// ─── Main Component ────────────────────────────────────────────
export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"enter" | "check" | "confetti" | "text" | "bar" | "done">("enter");
  const [progress, setProgress] = useState(0);

  const particles = useMemo(() => generateParticles(32), []);

  // ── Animation sequence ──
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1: Circle scales in
    timers.push(setTimeout(() => setPhase("check"), 300));

    // Phase 2: Checkmark draws
    timers.push(setTimeout(() => setPhase("confetti"), 700));

    // Phase 3: Confetti burst
    timers.push(setTimeout(() => setPhase("text"), 1100));

    // Phase 4: Text fades in + progress bar starts
    timers.push(setTimeout(() => setPhase("bar"), 1500));

    // Phase 5: Progress bar fills
    timers.push(setTimeout(() => {
      const startTime = Date.now();
      const duration = 2200;
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - pct, 3);
        setProgress(eased * 100);
        if (pct < 1) {
          requestAnimationFrame(tick);
        } else {
          setPhase("done");
        }
      };
      requestAnimationFrame(tick);
    }, 1600));

    // Auto-redirect
    timers.push(setTimeout(() => navigate("/customer/home", { replace: true }), 4200));

    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  const showCheck = phase !== "enter";
  const showConfetti = phase === "confetti" || phase === "text" || phase === "bar" || phase === "done";
  const showText = phase === "text" || phase === "bar" || phase === "done";
  const showBar = phase === "bar" || phase === "done";

  return (
    <div className="bg-white w-full h-screen flex flex-col relative overflow-hidden">
      {/* iOS Status Bar */}
      <div className="flex-shrink-0">
        <StatusBar />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-[24px] -mt-[40px]">
        {/* ── Animated Checkmark Container ── */}
        <div className="relative w-[140px] h-[140px] mb-[36px]">
          {/* Outer pulse rings */}
          <div
            className={`absolute inset-[-20px] rounded-full bg-[#56C490]/8 transition-all duration-700 ${
              showConfetti ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className={`absolute inset-[-40px] rounded-full bg-[#56C490]/4 transition-all duration-1000 ${
              showConfetti ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
            style={{ animationDelay: "0.4s" }}
          />

          {/* Pulsing ring animation */}
          {showConfetti && (
            <>
              <div
                className="absolute inset-[-8px] rounded-full border-[2px] border-[#56C490]/20 animate-ping"
                style={{ animationDuration: "2s" }}
              />
              <div
                className="absolute inset-[-18px] rounded-full border-[1.5px] border-[#56C490]/10 animate-ping"
                style={{ animationDuration: "2.5s", animationDelay: "0.3s" }}
              />
            </>
          )}

          {/* Green Circle */}
          <div
            className={`w-full h-full rounded-full bg-[#56C490] flex items-center justify-center shadow-[0_8px_40px_rgba(86,196,144,0.4)] transition-all duration-500 ease-out ${
              showCheck ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            {/* Checkmark SVG with draw animation */}
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              className={`transition-opacity duration-300 ${
                showCheck ? "opacity-100" : "opacity-0"
              }`}
            >
              <path
                d="M16 34L27 45L48 20"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="checkmark-path"
                style={{
                  strokeDasharray: 60,
                  strokeDashoffset: showCheck ? 0 : 60,
                  transition: "stroke-dashoffset 0.5s ease-out 0.15s",
                }}
              />
            </svg>
          </div>

          {/* ── Confetti Particles ── */}
          {showConfetti &&
            particles.map((p) => {
              const radians = (p.angle * Math.PI) / 180;
              const tx = Math.cos(radians) * p.distance;
              const ty = Math.sin(radians) * p.distance;

              return (
                <div
                  key={p.id}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    marginLeft: `-${p.size / 2}px`,
                    marginTop: `-${p.size / 2}px`,
                    backgroundColor: p.shape !== "star" ? p.color : "transparent",
                    borderRadius: p.shape === "circle" ? "50%" : p.shape === "square" ? "2px" : "0",
                    transform: `translate(${tx}px, ${ty}px) rotate(${p.rotation}deg) scale(0)`,
                    animation: `confetti-burst ${p.duration}s ease-out ${p.delay}s forwards`,
                    borderLeft: p.shape === "star" ? `${p.size / 2}px solid transparent` : undefined,
                    borderRight: p.shape === "star" ? `${p.size / 2}px solid transparent` : undefined,
                    borderBottom: p.shape === "star" ? `${p.size}px solid ${p.color}` : undefined,
                  }}
                />
              );
            })}
        </div>

        {/* ── Text Content ── */}
        <div
          className={`text-center transition-all duration-600 ease-out ${
            showText
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-[16px]"
          }`}
        >
          <h1 className="font-['Nunito',sans-serif] text-[22px] text-[#111827] tracking-[-0.3px] mb-[10px]">
            Payment Method Linked!
          </h1>
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.6] max-w-[280px] mx-auto">
            Your card has been securely added. You're all set to book your next
            service.
          </p>
        </div>

        {/* ── Progress Bar ── */}
        <div
          className={`w-full max-w-[220px] mt-[36px] transition-all duration-500 ease-out ${
            showBar
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-[12px]"
          }`}
        >
          {/* Track */}
          <div className="h-[4px] bg-[#E5E7EB] rounded-full overflow-hidden">
            {/* Fill */}
            <div
              className="h-full bg-[#56C490] rounded-full transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Label */}
          <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF] text-center mt-[12px]">
            Redirecting to home...
          </p>
        </div>

        {/* ── Secure Badge ── */}
        <div
          className={`flex items-center gap-[6px] mt-[28px] transition-all duration-500 delay-200 ${
            showBar
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-[8px]"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF]">
            256-bit SSL Encrypted
          </span>
        </div>
      </div>

      {/* ── Bottom Safe Area ── */}
      <div className="h-[34px] flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>

      {/* ── Keyframe Animations ── */}
      <style>{`
        @keyframes confetti-burst {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(0);
            opacity: 1;
          }
          20% {
            transform: translate(var(--tx, 0), var(--ty, 0)) rotate(180deg) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx, 0), var(--ty, 0)) rotate(360deg) scale(0);
            opacity: 0;
          }
        }

        @keyframes confetti-burst {
          0% {
            opacity: 1;
            transform: translate(0px, 0px) scale(0) rotate(0deg);
          }
          15% {
            opacity: 1;
            transform: scale(1.3);
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: scale(0.3) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
