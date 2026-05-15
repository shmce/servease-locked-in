import { useEffect } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/loading");
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: "linear-gradient(160deg, #C8EDD9 0%, #A8DEBB 40%, #8ED4A8 100%)" }}
    >
      {/* iOS Status Bar */}
      <div className="absolute h-[47px] left-0 top-0 w-full z-20">
        <StatusBar />
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-0 h-[34px] left-0 w-full z-20">
        <div className="absolute bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px] bg-white/40" />
      </div>

      {/* Soft ambient blobs */}
      <div
        className="absolute rounded-full"
        style={{
          width: 320,
          height: 320,
          top: -80,
          right: -80,
          background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 280,
          height: 280,
          bottom: 60,
          left: -100,
          background: "radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 180,
          height: 180,
          bottom: 180,
          right: 20,
          background: "radial-gradient(circle, rgba(255,200,160,0.2) 0%, transparent 70%)",
        }}
      />

      {/* ─── Claymorphism Tool Illustrations ─── */}
      {/* Floating wrench — top left cluster */}
      <div
        className="absolute animate-float"
        style={{ top: 100, left: 40, animationDelay: "0s", animationDuration: "4.2s" }}
      >
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <defs>
            <radialGradient id="wrenchGrad" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#7EC8A0" stopOpacity="1" />
              <stop offset="100%" stopColor="#4AAE7C" stopOpacity="1" />
            </radialGradient>
            <filter id="wrenchShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#3D9A68" floodOpacity="0.35" />
            </filter>
          </defs>
          <g filter="url(#wrenchShadow)">
            <rect x="6" y="6" width="60" height="60" rx="18" fill="url(#wrenchGrad)" />
            {/* Wrench shape */}
            <path
              d="M44 18C40.5 18 37.5 19.8 35.8 22.5L22 36.3L25.7 40L39.5 26.2C40 27.4 40.3 28.7 40.3 30C40.3 35.2 36.1 39.4 30.9 39.4C28.6 39.4 26.5 38.6 24.9 37.2L21.2 40.9C23.8 43.1 27.2 44.4 30.9 44.4C38.9 44.4 45.3 38 45.3 30C45.3 27.2 44.4 24.7 43 22.6L46.5 19.1C45.7 18.4 44.9 18 44 18Z"
              fill="white"
              fillOpacity="0.9"
            />
            <circle cx="30" cy="30" r="4" fill="white" fillOpacity="0.5" />
          </g>
        </svg>
      </div>

      {/* Floating paintbrush — top right */}
      <div
        className="absolute animate-float"
        style={{ top: 140, right: 36, animationDelay: "1s", animationDuration: "3.8s" }}
      >
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <defs>
            <radialGradient id="brushGrad" cx="35%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#FF9E8A" stopOpacity="1" />
              <stop offset="100%" stopColor="#E8705A" stopOpacity="1" />
            </radialGradient>
            <filter id="brushShadow">
              <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#D45A3A" floodOpacity="0.3" />
            </filter>
          </defs>
          <g filter="url(#brushShadow)">
            <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#brushGrad)" />
            {/* Paintbrush shape */}
            <rect x="29" y="12" width="6" height="28" rx="3" fill="white" fillOpacity="0.9" />
            <rect x="26" y="38" width="12" height="6" rx="3" fill="white" fillOpacity="0.7" />
            <ellipse cx="32" cy="47" rx="7" ry="5" fill="white" fillOpacity="0.85" />
            <ellipse cx="32" cy="48" rx="5" ry="4" fill="rgba(255,255,255,0.5)" />
          </g>
        </svg>
      </div>

      {/* Floating sparkle star — mid left */}
      <div
        className="absolute animate-float"
        style={{ top: 260, left: 24, animationDelay: "0.6s", animationDuration: "5s" }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <defs>
            <radialGradient id="starGrad" cx="35%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#FFF8E0" />
              <stop offset="60%" stopColor="#F5C96A" />
              <stop offset="100%" stopColor="#E8A830" />
            </radialGradient>
            <filter id="starShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#C48A10" floodOpacity="0.35" />
            </filter>
          </defs>
          <g filter="url(#starShadow)">
            <rect x="3" y="3" width="42" height="42" rx="13" fill="url(#starGrad)" />
            <path
              d="M24 10L26.4 18.8H35.6L28.6 24.1L31 32.9L24 27.6L17 32.9L19.4 24.1L12.4 18.8H21.6L24 10Z"
              fill="white"
              fillOpacity="0.92"
            />
          </g>
        </svg>
      </div>

      {/* Floating scissors — right middle */}
      <div
        className="absolute animate-float"
        style={{ top: 310, right: 28, animationDelay: "1.8s", animationDuration: "4.5s" }}
      >
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <defs>
            <radialGradient id="scGrad" cx="35%" cy="28%" r="68%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#9BBCE8" stopOpacity="1" />
              <stop offset="100%" stopColor="#6A98D8" stopOpacity="1" />
            </radialGradient>
            <filter id="scShadow">
              <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#4A78B8" floodOpacity="0.3" />
            </filter>
          </defs>
          <g filter="url(#scShadow)">
            <rect x="4" y="4" width="50" height="50" rx="15" fill="url(#scGrad)" />
            {/* Scissors shape */}
            <circle cx="19" cy="38" r="6" fill="white" fillOpacity="0.85" />
            <circle cx="39" cy="38" r="6" fill="white" fillOpacity="0.85" />
            <line x1="23" y1="34" x2="29" y2="26" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="35" y1="34" x2="29" y2="26" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="29" cy="25" r="3.5" fill="white" fillOpacity="0.7" />
            <line x1="22" y1="18" x2="29" y2="25" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="36" y1="18" x2="29" y2="25" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* Floating leaf — lower left */}
      <div
        className="absolute animate-float"
        style={{ bottom: 200, left: 50, animationDelay: "2.4s", animationDuration: "4.8s" }}
      >
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <defs>
            <radialGradient id="leafGrad" cx="35%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#D4F5E0" />
              <stop offset="55%" stopColor="#6CC992" />
              <stop offset="100%" stopColor="#3DAE6A" />
            </radialGradient>
            <filter id="leafShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2A8C50" floodOpacity="0.3" />
            </filter>
          </defs>
          <g filter="url(#leafShadow)">
            <rect x="3" y="3" width="46" height="46" rx="14" fill="url(#leafGrad)" />
            <path
              d="M26 12C26 12 38 18 38 30C38 38 33 42 26 42C19 42 14 38 14 30C14 18 26 12 26 12Z"
              fill="white"
              fillOpacity="0.85"
            />
            <line x1="26" y1="14" x2="26" y2="40" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
            <line x1="26" y1="24" x2="32" y2="20" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="26" y1="30" x2="20" y2="26" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* ─── Central Logo Card ─── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div
          className="flex flex-col items-center justify-center"
          style={{
            width: 200,
            height: 200,
            borderRadius: 40,
            background: "rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 24px 64px rgba(60, 130, 90, 0.18), 0 8px 24px rgba(60, 130, 90, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
            border: "1.5px solid rgba(255, 255, 255, 0.7)",
          }}
        >
          {/* ServEase S monogram in clay style */}
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 26,
              background: "linear-gradient(145deg, #7CD4A4 0%, #4AAE7C 100%)",
              boxShadow: "0 12px 32px rgba(74, 174, 124, 0.45), inset 0 2px 0 rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 44,
                fontWeight: 900,
                color: "white",
                lineHeight: 1,
                textShadow: "0 2px 6px rgba(0,0,0,0.15)",
                letterSpacing: -1,
              }}
            >
              S
            </span>
          </div>

          <span
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 20,
              fontWeight: 800,
              color: "#2C6E49",
              letterSpacing: -0.3,
            }}
          >
            ServEase
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(30, 80, 50, 0.7)",
            marginTop: 20,
            letterSpacing: 0.5,
          }}
        >
          Your trusted service partner
        </p>
      </div>
    </div>
  );
}
