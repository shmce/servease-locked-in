import { useEffect, useState } from "react";

interface StickyFooterButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function StickyFooterButton({ label, onClick, disabled = false }: StickyFooterButtonProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // On mobile, when the keyboard opens, the visualViewport height shrinks
      if (window.visualViewport) {
        const isKeyboard = window.visualViewport.height < window.innerHeight * 0.75;
        setKeyboardVisible(isKeyboard);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleResize);
      }
    };
  }, []);

  return (
    <div
      className="fixed left-0 right-0 z-[40] bg-white flex-shrink-0"
      style={{
        bottom: keyboardVisible && window.visualViewport
          ? window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop
          : 0,
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.05)",
        borderTop: "1px solid #F2F2F2",
        transition: "bottom 0.15s ease-out",
      }}
    >
      <div className="px-[20px] pt-[12px] pb-[8px]">
        <button
          onClick={onClick}
          disabled={disabled}
          className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[18px] rounded-[50px] transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 shadow-[0_4px_16px_rgba(86,196,144,0.25)]"
        >
          {label}
        </button>
      </div>
      {/* Home Indicator — iOS Safe Area */}
      {!keyboardVisible && (
        <div className="h-[34px] relative">
          <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
        </div>
      )}
    </div>
  );
}
