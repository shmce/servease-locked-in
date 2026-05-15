import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Check } from "lucide-react";

export default function CustomerRegistrationSuccess() {
  const navigate = useNavigate();
  const [secondsRemaining, setSecondsRemaining] = useState(3);

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const redirectTimer = setTimeout(() => {
      navigate("/customer/onboarding-complete");
    }, 3000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(redirectTimer);
      clearInterval(countdownInterval);
    };
  }, [navigate]);

  const handleGoToLogin = () => {
    navigate("/customer/onboarding-complete");
  };

  return (
    <div className="bg-white w-full h-full flex flex-col items-center justify-center px-[24px]">
      {/* Green Checkmark Circle with Animation */}
      <div 
        className="w-[100px] h-[100px] bg-[#56C490] rounded-full flex items-center justify-center mb-[24px] animate-[scaleIn_300ms_ease-out]"
        style={{
          animation: "scaleIn 300ms ease-out forwards",
        }}
      >
        <Check className="w-[60px] h-[60px] text-white" strokeWidth={3} />
      </div>

      {/* Title with Fade In */}
      <h1 
        className="font-['Nunito',sans-serif] text-[26px] text-[#1a1a1a] text-center mb-[16px] animate-[fadeIn_300ms_ease-out_100ms_forwards] opacity-0"
        style={{
          animation: "fadeIn 300ms ease-out 100ms forwards",
        }}
      >
        Account created successfully!
      </h1>

      {/* Body Text with Fade In */}
      <p 
        className="font-['Nunito',sans-serif] text-[15px] text-[#666] text-center mb-[32px] leading-[1.5] animate-[fadeIn_300ms_ease-out_200ms_forwards] opacity-0"
        style={{
          animation: "fadeIn 300ms ease-out 200ms forwards",
        }}
      >
        Welcome to ServEase! Please log in to continue.
      </p>

      {/* Button with Fade In */}
      <button
        onClick={handleGoToLogin}
        className="w-full max-w-[400px] bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[50px] transition-all active:scale-95 shadow-[0_2px_12px_rgba(86,196,144,0.2)] animate-[fadeIn_300ms_ease-out_300ms_forwards] opacity-0"
        style={{
          animation: "fadeIn 300ms ease-out 300ms forwards",
        }}
      >
        Go to Login
      </button>

      {/* Auto-redirect countdown */}
      <p 
        className="font-['Nunito',sans-serif] text-[13px] text-[#999] text-center mt-[16px] animate-[fadeIn_300ms_ease-out_400ms_forwards] opacity-0"
        style={{
          animation: "fadeIn 300ms ease-out 400ms forwards",
        }}
      >
        Redirecting in {secondsRemaining} second{secondsRemaining !== 1 ? 's' : ''}...
      </p>

      <style>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          60% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}