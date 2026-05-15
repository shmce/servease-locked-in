import svgPaths from "../../imports/svg-5kmfjot4nz";

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

export function StatusBar() {
  return (
    <div className="h-[47px] w-full overflow-clip relative flex-shrink-0" data-name="Status Bar / iPhone 13 & 13 Pro">
      <div className="absolute h-[47px] left-0 top-0 w-[88px]" data-name="Clock">
        <Clock />
      </div>
      <IndicatorsGroup />
    </div>
  );
}
