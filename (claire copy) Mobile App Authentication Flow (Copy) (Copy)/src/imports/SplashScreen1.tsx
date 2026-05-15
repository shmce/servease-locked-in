import svgPaths from "./svg-3paqv1chir";
import imgImage2 from "figma:asset/8743e8c71970867943418ac218df9bbc95c1aec7.png";
import imgImage4 from "figma:asset/54bd1b6ccb19f27637d7b99c1f7bf304c0cfaab3.png";
import imgImage3 from "figma:asset/bcb5566374c6dbabeaa8746e77c28495ce54c4a0.png";
import imgImg01571 from "figma:asset/3a4fdd3b26abebdff72f69158b0469fcd32d7f38.png";
import imgScreenshot20260302At220141RemovebgPreview1 from "figma:asset/f5a6a28739bed7a9af038e3bf55db0c6b4b73bfc.png";

function Frame() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white content-stretch flex items-center justify-center left-1/2 px-[122.5px] py-[16px] rounded-[50px] top-[calc(50%+55.5px)] w-[350px]">
      <p className="font-['Poppins:Bold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#00bf63] text-[15px] text-center tracking-[-0.45px] whitespace-nowrap">Sign up to ServEase</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex items-center justify-center left-1/2 px-[122.5px] py-[16px] rounded-[50px] top-[calc(50%+128.5px)] w-[350px]">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[50px]" />
      <p className="font-['Poppins:Bold',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[15px] text-center text-white tracking-[-0.45px] whitespace-nowrap">{`Login `}</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute h-[800px] left-0 overflow-clip top-[47px] w-[390px]">
      <div className="absolute h-[154.348px] left-[247px] top-[658px] w-[200px]" data-name="image 4">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage4} />
      </div>
      <p className="-translate-x-1/2 absolute font-['Poppins:Regular',sans-serif] leading-[1.5] left-1/2 not-italic text-[15px] text-center text-white top-[343px] tracking-[-0.45px] w-[336px]">Finding and connecting with trusted local professionals around you.</p>
      <p className="-translate-x-1/2 [text-decoration-skip-ink:none] absolute decoration-solid font-['Poppins:Medium',sans-serif] leading-[1.5] left-1/2 not-italic text-[15px] text-[rgba(255,255,255,0.9)] text-center top-[579px] tracking-[-0.45px] underline w-[350px]">Skip this step</p>
      <div className="absolute flex h-[229.798px] items-center justify-center left-[-96px] top-[605px] w-[246.999px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="flex-none rotate-[159.59deg]">
          <div className="h-[170.769px] relative w-[200px]" data-name="image 3">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage3} />
          </div>
        </div>
      </div>
      <Frame />
      <Frame2 />
    </div>
  );
}

function Clock() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex gap-[2px] items-center justify-center left-[calc(50%+20px)] top-[17px]" data-name="Clock">
      <div className="flex flex-col font-['SF_Pro:Semibold',sans-serif] font-[590] justify-center leading-[0] relative shrink-0 text-[17px] text-center text-white tracking-[-0.5px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100", fontFeatureSettings: "'ss03'" }}>
        <p className="leading-[17px]">9:41</p>
      </div>
    </div>
  );
}

function IndicatorsGroup() {
  return (
    <div className="absolute content-stretch flex gap-[7px] items-center right-[26.7px] top-[19px]" data-name="Indicators group">
      <div className="h-[12px] relative shrink-0 w-[19.971px]" data-name="Signal">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9707 12">
          <path d={svgPaths.pe92800} fill="var(--fill-0, white)" id="Cellular Connection" />
        </svg>
      </div>
      <div className="h-[12.5px] relative shrink-0 w-[17px]" data-name="Connection">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 12.5001">
          <path d={svgPaths.p2b7cea80} fill="var(--fill-0, white)" id="Wifi" />
        </svg>
      </div>
      <div className="h-[13px] relative shrink-0 w-[27.33px]" data-name="Battery">
        <div className="absolute border border-solid border-white inset-[0_8.53%_0_0] opacity-40 rounded-[4px]" data-name="Border" />
        <div className="absolute inset-[34.62%_0_34.62%_95.13%]" data-name="Cap">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.33 4">
            <path d={svgPaths.p1847ee80} fill="var(--fill-0, white)" id="Cap" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute bg-white inset-[15.38%_30.48%_15.38%_7.32%] rounded-[2px]" data-name="Capacity" />
      </div>
    </div>
  );
}

export default function SplashScreen() {
  return (
    <div className="bg-[#00bf63] relative size-full" data-name="Splash Screen 1">
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
      <Frame1 />
      <div className="absolute h-[264.166px] left-[266px] top-[-4px] w-[160px]" data-name="IMG_0157 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImg01571} />
      </div>
      <div className="-translate-x-1/2 absolute h-[47px] left-1/2 overflow-clip top-0 w-[390px]" data-name="Status Bar / iPhone 13 & 13 Pro">
        <div className="absolute h-[47px] left-0 top-0 w-[88px]" data-name="Clock">
          <Clock />
        </div>
        <IndicatorsGroup />
      </div>
      <div className="absolute h-[53px] left-[49px] top-[308px] w-[293px]" data-name="Screenshot_2026-03-02_at_22.01.41-removebg-preview 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgScreenshot20260302At220141RemovebgPreview1} />
      </div>
    </div>
  );
}