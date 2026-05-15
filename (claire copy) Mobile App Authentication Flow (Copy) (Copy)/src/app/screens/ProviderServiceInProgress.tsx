import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Pause, Play, Camera, MessageCircle, DollarSign, Coffee, CheckCircle, User, MapPin, Calendar, Clock } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function ProviderServiceInProgress() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [notes, setNotes] = useState("");

  const customer = {
    name: "Juan Dela Cruz",
    photo: "https://i.pravatar.cc/150?img=12"
  };

  const serviceDetails = {
    type: "Plumbing Repair",
    date: "March 15, 2026",
    time: "2:00 PM",
    location: "123 Rizal Street, Brgy. Poblacion, Makati City, Metro Manila",
    description: "Kitchen sink is leaking badly. Water is dripping from the pipe underneath. Need urgent repair.",
    estimatedDuration: "2 hours"
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Fixed Header */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0 border-b border-[#f2f2f2]">
        <button
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Service In Progress
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        {/* Large Service Timer */}
        <div className="mt-[24px] mb-[20px] text-center bg-gradient-to-br from-[#56C490] to-[#00a355] rounded-[20px] p-[32px] shadow-lg">
          <p className="font-['Nunito',sans-serif] text-[14px] text-white/80 mb-[8px]">
            Service Timer
          </p>
          <p className="font-['Nunito',sans-serif] text-[56px] text-white leading-none mb-[16px]">
            {formatTime(elapsedSeconds)}
          </p>
          <div className="flex items-center justify-center gap-[8px]">
            <div className={`w-[8px] h-[8px] rounded-full ${isTimerRunning ? 'bg-white animate-pulse' : 'bg-white/40'}`} />
            <p className="font-['Nunito',sans-serif] text-[13px] text-white/90">
              {isTimerRunning ? 'Timer Running' : 'Timer Paused'}
            </p>
          </div>
        </div>

        {/* Pause/Resume Timer Buttons */}
        <div className="grid grid-cols-2 gap-[8px] mb-[20px]">
          {isTimerRunning ? (
            <button
              onClick={toggleTimer}
              className="col-span-2 w-full bg-[#F59E0B] text-white font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[8px]"
            >
              <Pause className="w-[18px] h-[18px]" />
              Pause Timer
            </button>
          ) : (
            <button
              onClick={toggleTimer}
              className="col-span-2 w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] flex items-center justify-center gap-[8px]"
            >
              <Play className="w-[18px] h-[18px]" />
              Resume Timer
            </button>
          )}
        </div>

        {/* Minimized Customer Info Card */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[12px] mb-[20px]">
          <div className="flex items-center gap-[10px]">
            <img
              src={customer.photo}
              alt={customer.name}
              className="w-[40px] h-[40px] rounded-full object-cover border-2 border-[#f5f5f5]"
            />
            <div className="flex-1">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                {customer.name}
              </p>
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
                Customer
              </p>
            </div>
          </div>
        </div>

        {/* Service Details Summary (Readonly) */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[20px]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[12px]">
            Service Details
          </p>
          
          <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#1a1a1a] mb-[12px]">
            {serviceDetails.type}
          </h3>

          <div className="space-y-[10px] mb-[12px]">
            <div className="flex items-center gap-[8px]">
              <Calendar className="w-[14px] h-[14px] text-[#666]" />
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#666]">
                {serviceDetails.date} at {serviceDetails.time}
              </p>
            </div>
            <div className="flex items-center gap-[8px]">
              <Clock className="w-[14px] h-[14px] text-[#666]" />
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#666]">
                Est. Duration: {serviceDetails.estimatedDuration}
              </p>
            </div>
            <div className="flex items-start gap-[8px]">
              <MapPin className="w-[14px] h-[14px] text-[#666] flex-shrink-0 mt-[2px]" />
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#666] flex-1">
                {serviceDetails.location}
              </p>
            </div>
          </div>

          <div className="border-t border-[#f2f2f2] pt-[12px]">
            <p className="font-['Nunito',sans-serif] text-[12px] text-[#374151] mb-[4px]">
              Description
            </p>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-relaxed">
              {serviceDetails.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-[8px] mb-[20px]">
          <button 
            onClick={() => navigate(`/provider/progress-photos/${id}`)}
            className="w-full bg-white border-2 border-[#56C490] text-[#56C490] font-['Nunito',sans-serif] text-[15px] py-[12px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[8px]"
          >
            <Camera className="w-[18px] h-[18px]" />
            Upload Progress Photos
          </button>

          <button 
            onClick={() => navigate(`/provider/job-update/${id}`)}
            className="w-full bg-white border-2 border-[#e5e5e5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[14px] py-[12px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[8px]"
          >
            <MessageCircle className="w-[16px] h-[16px]" />
            Send Update to Customer
          </button>

          <button 
            onClick={() => navigate(`/provider/request-additional-payment/${id}`)}
            className="w-full bg-white border-2 border-[#e5e5e5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[14px] py-[12px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[8px]"
          >
            <DollarSign className="w-[16px] h-[16px]" />
            Request Additional Payment
          </button>

          <button 
            onClick={() => navigate(`/provider/break-status/${id}`)}
            className="w-full bg-white border-2 border-[#e5e5e5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[14px] py-[12px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[8px]"
          >
            <Coffee className="w-[16px] h-[16px]" />
            Take Break
          </button>
        </div>

        {/* Notes Field */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[24px]">
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px]">
            Notes (for completion report)
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about the service, issues encountered, parts used, etc."
            rows={4}
            className="w-full px-[12px] py-[10px] bg-[#f5f5f5] border border-[#e5e5e5] rounded-[10px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] resize-none"
          />
        </div>

        {/* Spacer for fixed button */}
        <div className="h-[80px]" />
      </div>

      {/* Fixed Bottom Button */}
      <div className="px-[24px] py-[16px] bg-white border-t border-[#f2f2f2] flex-shrink-0">
        <button
          onClick={() => navigate(`/provider/complete-service/${id}`, { state: { elapsedSeconds } })}
          className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] flex items-center justify-center gap-[8px]"
        >
          <CheckCircle className="w-[20px] h-[20px]" />
          Complete Service
        </button>
      </div>

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}