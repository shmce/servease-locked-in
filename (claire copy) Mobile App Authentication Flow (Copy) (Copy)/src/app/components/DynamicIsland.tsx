import { CheckCircle2, Clock, MapPin, Shield, User, Calendar, Sparkles } from "lucide-react";

type IconType = 'welcome' | 'profile' | 'location' | 'clock' | 'shield' | 'calendar' | 'success' | 'processing';

interface DynamicIslandProps {
  icon: IconType;
  animated?: boolean;
}

export function DynamicIsland({ icon, animated = false }: DynamicIslandProps) {
  const renderIcon = () => {
    const iconClass = "w-[14px] h-[14px]";
    
    switch (icon) {
      case 'welcome':
        return <Sparkles className={`${iconClass} text-[#56C490]`} />;
      case 'profile':
        return <User className={`${iconClass} text-white`} />;
      case 'location':
        return <MapPin className={`${iconClass} text-white`} />;
      case 'clock':
        return <Clock className={`${iconClass} text-white`} />;
      case 'shield':
        return <Shield className={`${iconClass} text-white`} />;
      case 'calendar':
        return <Calendar className={`${iconClass} text-white`} />;
      case 'success':
        return <CheckCircle2 className={`${iconClass} text-[#56C490]`} />;
      case 'processing':
        return <div className="w-[14px] h-[14px] border-2 border-white border-t-transparent rounded-full animate-spin" />;
    }
  };

  return (
    <div className="h-[47px] bg-white flex items-center justify-center flex-shrink-0">
      <div className={`bg-black rounded-[28px] h-[37px] w-[126px] flex items-center justify-center gap-[8px] ${
        animated ? 'animate-pulse' : ''
      }`}>
        {renderIcon()}
        {(icon === 'processing' || icon === 'success') && (
          <div className="flex gap-[3px]">
            <div className="w-[3px] h-[3px] bg-white rounded-full opacity-60" />
            <div className="w-[3px] h-[3px] bg-white rounded-full opacity-40" />
            <div className="w-[3px] h-[3px] bg-white rounded-full opacity-20" />
          </div>
        )}
      </div>
    </div>
  );
}
