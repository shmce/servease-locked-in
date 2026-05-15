import { Check } from "lucide-react";

interface TimelineStep {
  label: string;
  completed: boolean;
}

interface StatusTimelineProps {
  steps: TimelineStep[];
}

export function StatusTimeline({ steps }: StatusTimelineProps) {
  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute top-[16px] left-0 right-0 h-[2px] bg-[#E5E7EB]" />
      <div
        className="absolute top-[16px] left-0 h-[2px] bg-[#56C490] transition-all duration-300"
        style={{
          width: `${(steps.filter(s => s.completed).length / (steps.length - 1)) * 100}%`,
        }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center" style={{ flex: 1 }}>
            {/* Circle/Checkmark */}
            <div
              className={`w-[32px] h-[32px] rounded-full flex items-center justify-center mb-[8px] transition-colors ${
                step.completed
                  ? "bg-[#56C490]"
                  : "bg-white border-2 border-[#E5E7EB]"
              }`}
            >
              {step.completed ? (
                <Check className="w-[18px] h-[18px] text-white" />
              ) : (
                <div className="w-[8px] h-[8px] rounded-full bg-[#E5E7EB]" />
              )}
            </div>

            {/* Label */}
            <div
              className={`font-['Inter',sans-serif] text-[11px] text-center max-w-[70px] ${
                step.completed ? "text-[#111827] font-medium" : "text-[#9CA3AF]"
              }`}
            >
              {step.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
