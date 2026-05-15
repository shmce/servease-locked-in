import svgPaths from "../../imports/svg-9mcfl6w3md";

export function GooglePlayBadge() {
  return (
    <div className="relative bg-black border border-[#a6a6a6] h-[52px] rounded-[5px] w-[170px] cursor-pointer hover:opacity-90 transition-opacity overflow-hidden flex-shrink-0">
      <div className="absolute inset-0 flex items-center">
        {/* Google Play logo */}
        <div className="w-8 h-8 ml-3">
          <svg className="block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 34.5491 38.5811">
            <defs>
              <linearGradient gradientUnits="userSpaceOnUse" id="gp0" x1="17.6979" x2="-7.47503" y1="2.35211" y2="27.4629">
                <stop stopColor="#00A0FF" /><stop offset="1" stopColor="#00E3FF" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="gp1" x1="35.7024" x2="-0.501857" y1="19.2901" y2="19.2901">
                <stop stopColor="#FFE000" /><stop offset="1" stopColor="#FF9C00" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="gp2" x1="22.2276" x2="-11.91" y1="22.731" y2="56.7843">
                <stop stopColor="#FF3A44" /><stop offset="1" stopColor="#C31162" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="gp3" x1="-4.00349" x2="11.2399" y1="-10.4462" y2="4.75958">
                <stop stopColor="#32A071" /><stop offset="1" stopColor="#00F076" />
              </linearGradient>
            </defs>
            <path d={svgPaths.pfe27a00} fill="url(#gp0)" />
            <path d={svgPaths.p1ea7b0c0} fill="url(#gp1)" />
            <path d={svgPaths.p25bbe070} fill="url(#gp2)" />
            <path d={svgPaths.p29226500} fill="url(#gp3)" />
          </svg>
        </div>
        <div className="ml-2 flex flex-col justify-center">
          <span className="text-white text-[8px] font-['Inter',sans-serif] leading-none">GET IT ON</span>
          <span className="text-white text-sm font-['Inter',sans-serif] leading-tight">Google Play</span>
        </div>
      </div>
    </div>
  );
}

export function AppStoreBadge() {
  return (
    <div className="relative bg-[#0c0d10] border border-[#a6a6a6] h-[52px] rounded-[7px] w-[150px] cursor-pointer hover:opacity-90 transition-opacity overflow-hidden flex-shrink-0">
      <div className="absolute inset-0 flex items-center">
        {/* Apple logo */}
        <div className="w-6 h-7 ml-3">
          <svg className="block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 26.5748 32.6639">
            <path d={svgPaths.p17ea9f00} fill="white" />
            <path d={svgPaths.p1c7e3700} fill="white" />
          </svg>
        </div>
        <div className="ml-2 flex flex-col justify-center">
          <span className="text-white text-[8px] font-['Inter',sans-serif] leading-none">Download on the</span>
          <span className="text-white text-sm font-['Inter',sans-serif] leading-tight">App Store</span>
        </div>
      </div>
    </div>
  );
}
