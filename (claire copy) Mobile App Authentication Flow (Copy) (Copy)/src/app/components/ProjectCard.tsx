interface ProjectCardProps {
  serviceType: string;
  scheduledDate: string;
  frequency?: string;
  serviceProviderName: string;
  actionLabel: string;
  onCardClick: () => void;
  onActionClick: () => void;
  showDispute?: boolean;
  onDisputeClick?: () => void;
}

export function ProjectCard({
  serviceType,
  scheduledDate,
  frequency,
  serviceProviderName,
  actionLabel,
  onCardClick,
  onActionClick,
  showDispute = false,
  onDisputeClick,
}: ProjectCardProps) {
  return (
    <div
      onClick={onCardClick}
      className="bg-white rounded-[12px] p-[20px] cursor-pointer active:scale-[0.98] transition-transform border border-[#F2F2F2]"
    >
      <div className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[6px]">
        {serviceType}
      </div>

      <div className="font-['Inter',sans-serif] text-[14px] text-[#6B7280] mb-[4px]">
        Scheduled for {scheduledDate}
      </div>

      {frequency && (
        <div className="font-['Inter',sans-serif] text-[14px] text-[#6B7280] mb-[12px]">
          {frequency}
        </div>
      )}

      <div className="flex items-center justify-between pt-[12px] border-t border-[#F2F2F2]">
        <div>
          <div className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF] mb-[2px]">
            Service Provider
          </div>
          <div className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
            {serviceProviderName}
          </div>
        </div>

        {showDispute ? (
          <div className="flex gap-[8px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onActionClick();
              }}
              className="px-[16px] py-[10px] rounded-[8px] border border-[#56C490] font-['Nunito',sans-serif] text-[14px] text-[#56C490] active:scale-[0.95] transition-transform"
            >
              {actionLabel}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDisputeClick?.();
              }}
              className="px-[16px] py-[10px] rounded-[8px] border border-[#EF4444] font-['Nunito',sans-serif] text-[14px] text-[#EF4444] active:scale-[0.95] transition-transform"
            >
              Report
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActionClick();
            }}
            className="px-[20px] py-[10px] rounded-[8px] bg-[#56C490] font-['Nunito',sans-serif] text-[14px] text-white active:scale-[0.95] transition-transform"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}