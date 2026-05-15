import { useNavigate } from "react-router";
import { useState } from "react";
import { StatusBar } from "../components/StatusBar";
import imgImage2 from "figma:asset/8743e8c71970867943418ac218df9bbc95c1aec7.png";
import imgImage4 from "figma:asset/54bd1b6ccb19f27637d7b99c1f7bf304c0cfaab3.png";
import imgImage3 from "figma:asset/bcb5566374c6dbabeaa8746e77c28495ce54c4a0.png";
import imgImg01571 from "figma:asset/3a4fdd3b26abebdff72f69158b0469fcd32d7f38.png";
import imgScreenshot20260302At220141RemovebgPreview1 from "figma:asset/f5a6a28739bed7a9af038e3bf55db0c6b4b73bfc.png";

function Frame({ isAgreed }: { isAgreed: boolean }) {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => isAgreed && navigate("/signup-role-selection")}
      disabled={!isAgreed}
      className={`-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex items-center justify-center left-1/2 px-[122.5px] py-[16px] rounded-[50px] top-[calc(50%+55.5px)] w-[350px] transition-all ${
        isAgreed 
          ? 'bg-white active:scale-95 cursor-pointer' 
          : 'bg-white/30 cursor-not-allowed'
      }`}
    >
      <p className={`font-['Nunito',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[15px] text-center tracking-[-0.45px] whitespace-nowrap ${
        isAgreed ? 'text-[#56C490]' : 'text-[#56C490]/40'
      }`}>
        Sign up to ServEase
      </p>
    </button>
  );
}

function Frame2({ isAgreed }: { isAgreed: boolean }) {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => isAgreed && navigate("/login-role-selection")}
      disabled={!isAgreed}
      className={`-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex items-center justify-center left-1/2 px-[122.5px] py-[16px] rounded-[50px] top-[calc(50%+128.5px)] w-[350px] transition-all ${
        isAgreed 
          ? 'active:scale-95 cursor-pointer' 
          : 'cursor-not-allowed'
      }`}
    >
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[50px] ${
        isAgreed ? 'border-white' : 'border-white/30'
      }`} />
      <p className={`font-['Nunito',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[15px] text-center tracking-[-0.45px] whitespace-nowrap ${
        isAgreed ? 'text-white' : 'text-white/40'
      }`}>
        Log In
      </p>
    </button>
  );
}

function LegalLinks({ isAgreed, setIsAgreed }: { isAgreed: boolean; setIsAgreed: (value: boolean) => void }) {
  const navigate = useNavigate();

  return (
    <div className="-translate-x-1/2 absolute left-1/2 top-[calc(50%+190px)] w-[320px] px-[20px]">
      {/* Checkbox with Label */}
      <label className="flex items-start gap-[10px] cursor-pointer mb-[8px]">
        <input
          type="checkbox"
          checked={isAgreed}
          onChange={(e) => setIsAgreed(e.target.checked)}
          className="mt-[2px] w-[18px] h-[18px] accent-white cursor-pointer flex-shrink-0"
        />
        <span className="font-['Nunito',sans-serif] text-[11px] text-white/90 leading-[1.6] text-left">
          I have read and agree to the{" "}
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate("/terms-and-conditions");
            }}
            className="underline font-['Nunito',sans-serif] text-[11px] text-white transition-opacity active:opacity-60"
          >
            Terms &amp; Conditions
          </button>{" "}
          and{" "}
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate("/privacy-policy");
            }}
            className="underline font-['Nunito',sans-serif] text-[11px] text-white transition-opacity active:opacity-60"
          >
            Privacy Policy
          </button>
          .
        </span>
      </label>
    </div>
  );
}

function Frame1({ isAgreed, setIsAgreed }: { isAgreed: boolean; setIsAgreed: (value: boolean) => void }) {
  return (
    <div className="absolute h-[800px] left-0 overflow-clip top-[47px] w-[390px]">
      <div className="absolute h-[154.348px] left-[247px] top-[658px] w-[200px]" data-name="image 4">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage4} />
      </div>
      <p className="-translate-x-1/2 absolute font-['Nunito',sans-serif] leading-[1.5] left-1/2 not-italic text-[15px] text-center text-white top-[343px] tracking-[-0.45px] w-[336px]">
        Finding and connecting with trusted local professionals around you.
      </p>
      <div className="absolute flex h-[229.798px] items-center justify-center left-[-96px] top-[605px] w-[246.999px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="flex-none rotate-[159.59deg]">
          <div className="h-[170.769px] relative w-[200px]" data-name="image 3">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage3} />
          </div>
        </div>
      </div>
      <Frame isAgreed={isAgreed} />
      <Frame2 isAgreed={isAgreed} />
      <LegalLinks isAgreed={isAgreed} setIsAgreed={setIsAgreed} />
    </div>
  );
}

export default function AuthGate() {
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <div className="bg-[#56C490] relative w-full h-full" data-name="Splash Screen 1">
      <div className="absolute bottom-0 h-[34px] left-0 w-[390px]" data-name="Home Indicator">
        <div className="-translate-x-1/2 absolute bg-black bottom-[8px] h-[5px] left-[calc(50%+0.5px)] rounded-[100px] w-[134px]" data-name="Home Indicator" />
      </div>
      <div className="absolute flex h-[165.818px] items-center justify-center left-[-56px] top-[-1px] w-[160px]">
        <div className="flex-none rotate-180">
          <div className="h-[165.818px] relative w-[160px]" data-name="image 2">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
          </div>
        </div>
      </div>
      <Frame1 isAgreed={isAgreed} setIsAgreed={setIsAgreed} />
      <div className="absolute h-[264.166px] left-[266px] top-[-4px] w-[160px]" data-name="IMG_0157 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg01571} />
      </div>
      <div className="-translate-x-1/2 absolute h-[47px] left-1/2 overflow-clip top-0 w-[390px]" data-name="Status Bar / iPhone 13 & 13 Pro">
        <StatusBar />
      </div>
      <div className="absolute h-[53px] left-[49px] top-[308px] w-[293px]" data-name="Screenshot_2026-03-02_at_22.01.41-removebg-preview 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgScreenshot20260302At220141RemovebgPreview1} />
      </div>
    </div>
  );
}