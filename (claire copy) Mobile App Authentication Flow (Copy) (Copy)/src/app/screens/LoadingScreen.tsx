import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import imgServEaseLogo from "figma:asset/f5a6a28739bed7a9af038e3bf55db0c6b4b73bfc.png";

/**
 * SPLASH SCREEN SEQUENCE
 *
 * Screen 1 (Splash):
 *   - Full-screen brand green (#56C490) background
 *   - Centered ServEase wordmark in white
 *   - No status bar, no navigation — immersive splash
 *
 * Screen 2 (Auth Switch / Transition):
 *   - Full-screen white background
 *   - Centered three-dot loading indicator
 *   - Acts as the Auth Switch:
 *       • If user is "new-provider@servease.ph" → route to /provider/add-payout-method
 *       • If user role is "provider" → route to /provider/home
 *       • If user role is "customer" → route to /customer/home
 *       • No session → route to /auth-gate
 *
 * In production, replace the simulated auth check with a real
 * authentication service (e.g., Supabase Auth, Firebase Auth).
 */

export default function LoadingScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"splash" | "transition">("splash");

  // Phase 1 → Phase 2 after 2 seconds
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setPhase("transition");
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  // When phase becomes "transition", start auth check
  useEffect(() => {
    if (phase !== "transition") return;

    const authTimer = setTimeout(() => {
      /**
       * AUTH SWITCH:
       * Replace this block with real auth check.
       * Expo equivalent: router.replace('/path')
       *
       * Example:
       *   const user = await supabase.auth.getUser();
       *   if (!user) return router.replace('/auth-gate');
       *   if (user.email === "new-provider@servease.ph") router.replace('/provider/add-payout-method');
       *   else if (user.role === "provider") router.replace('/provider/home');
       *   else router.replace('/customer/home');
       */
      const simulatedEmail = localStorage.getItem("servease_user_email");
      const simulatedRole = localStorage.getItem("servease_user_role");

      if (simulatedEmail === "new-provider@servease.ph") {
        navigate("/provider/add-payout-method", { replace: true });
      } else if (simulatedRole === "provider") {
        navigate("/provider/home", { replace: true });
      } else if (simulatedEmail) {
        navigate("/customer/home", { replace: true });
      } else {
        navigate("/auth-gate", { replace: true });
      }
    }, 1500);

    return () => clearTimeout(authTimer);
  }, [phase, navigate]);

  // ─── Screen 1: Brand Splash ───
  if (phase === "splash") {
    return (
      <div className="bg-[#56C490] w-full h-full flex items-center justify-center overflow-hidden">
        {/* Official ServEase Brand Logo — rendered exactly as provided, no filters */}
        <img
          src={imgServEaseLogo}
          alt="ServEase"
          className="w-[260px] h-auto pointer-events-none select-none"
          draggable={false}
        />
      </div>
    );
  }

  // ─── Screen 2: Three-Dot Loader (Auth Switch) ───
  return (
    <div className="bg-white w-full h-full flex items-center justify-center overflow-hidden">
      {/* Three-dot loading indicator */}
      <div className="flex items-center gap-[10px]">
        <span
          className="w-[10px] h-[10px] rounded-full bg-[#56C490]"
          style={{ animation: "dotPulse 1.2s ease-in-out 0s infinite" }}
        />
        <span
          className="w-[10px] h-[10px] rounded-full bg-[#56C490]"
          style={{ animation: "dotPulse 1.2s ease-in-out 0.2s infinite" }}
        />
        <span
          className="w-[10px] h-[10px] rounded-full bg-[#56C490]"
          style={{ animation: "dotPulse 1.2s ease-in-out 0.4s infinite" }}
        />
      </div>

      {/* Keyframes for dot animation */}
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% {
            opacity: 0.25;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}