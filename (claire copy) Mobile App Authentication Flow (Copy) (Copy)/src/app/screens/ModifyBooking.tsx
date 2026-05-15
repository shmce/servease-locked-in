import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import MobileContainer from "../components/MobileContainer";
import { ArrowLeft, Calendar, MapPin, FileText, Image, Info } from "lucide-react";
import { StickyFooterButton } from "../components/StickyFooterButton";

export default function ModifyBooking() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const currentBooking = {
    date: "March 15, 2026",
    time: "10:00 AM - 12:00 PM",
    location: "123 Bonifacio St, Makati City, Metro Manila",
    description: "Deep cleaning of living room, kitchen, and 2 bedrooms",
  };

  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleSubmit = () => {
    // Handle modification submission
    navigate(-1);
  };

  return (
    <MobileContainer>
      <div className="h-full bg-[#F9FAFB] flex flex-col">
        {/* Status Bar */}
        <div className="bg-[#56C490] flex-shrink-0">
          <StatusBar />
        </div>

        {/* Header */}
        <div className="bg-[#56C490] px-[24px] py-[16px] flex items-center gap-[16px] flex-shrink-0">
          <button onClick={() => navigate(-1)} className="active:scale-90 transition-transform">
            <ArrowLeft className="w-[24px] h-[24px] text-white" />
          </button>
          <h1 className="font-['Nunito',sans-serif] text-[18px] text-white">
            Modify Booking
          </h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-[120px]">
          <div className="px-[24px] py-[20px] space-y-[16px]">
            {/* Current Booking Details */}
            <div className="bg-[#F3F4F6] rounded-[16px] p-[16px]">
              <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[12px]">
                Current Booking Details
              </h2>

              <div className="space-y-[8px]">
                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF]">
                    Date & Time
                  </span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                    {currentBooking.date}, {currentBooking.time}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF]">
                    Location
                  </span>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151] text-right max-w-[200px]">
                    {currentBooking.location}
                  </span>
                </div>

                <div className="pt-[8px] border-t border-[#E5E7EB]">
                  <div className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF] mb-[4px]">
                    Description
                  </div>
                  <div className="font-['Inter',sans-serif] text-[14px] text-[#374151]">
                    {currentBooking.description}
                  </div>
                </div>
              </div>
            </div>

            {/* What to Change */}
            <div className="bg-white rounded-[16px] p-[16px]" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
              <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
                What would you like to change?
              </h2>

              <div className="space-y-[12px]">
                {/* Change Date/Time */}
                <div
                  onClick={() => toggleOption("datetime")}
                  className={`p-[16px] rounded-[12px] border-2 cursor-pointer transition-all ${
                    selectedOptions.includes("datetime")
                      ? "border-[#56C490] bg-[#F0FDF4]"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <div className="flex items-center gap-[12px] mb-[12px]">
                    <Calendar className="w-[20px] h-[20px] text-[#56C490]" />
                    <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                      Change date/time
                    </span>
                  </div>

                  {selectedOptions.includes("datetime") && (
                    <div className="space-y-[12px] pl-[32px]">
                      <div>
                        <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                          New Date
                        </label>
                        <input
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full px-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                        />
                      </div>

                      <div>
                        <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                          New Time
                        </label>
                        <input
                          type="time"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-full px-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Change Location */}
                <div
                  onClick={() => toggleOption("location")}
                  className={`p-[16px] rounded-[12px] border-2 cursor-pointer transition-all ${
                    selectedOptions.includes("location")
                      ? "border-[#56C490] bg-[#F0FDF4]"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <div className="flex items-center gap-[12px] mb-[12px]">
                    <MapPin className="w-[20px] h-[20px] text-[#56C490]" />
                    <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                      Change location
                    </span>
                  </div>

                  {selectedOptions.includes("location") && (
                    <div className="pl-[32px]">
                      <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                        New Address
                      </label>
                      <textarea
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="Enter new address"
                        rows={3}
                        className="w-full px-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20 resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Edit Description */}
                <div
                  onClick={() => toggleOption("description")}
                  className={`p-[16px] rounded-[12px] border-2 cursor-pointer transition-all ${
                    selectedOptions.includes("description")
                      ? "border-[#56C490] bg-[#F0FDF4]"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <div className="flex items-center gap-[12px] mb-[12px]">
                    <FileText className="w-[20px] h-[20px] text-[#56C490]" />
                    <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                      Add/Edit description
                    </span>
                  </div>

                  {selectedOptions.includes("description") && (
                    <div className="pl-[32px]">
                      <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                        Description
                      </label>
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Add special instructions or details"
                        rows={4}
                        className="w-full px-[16px] py-[12px] rounded-[12px] border border-[#E5E7EB] font-['Inter',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20 resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Add Photos */}
                <div
                  onClick={() => toggleOption("photos")}
                  className={`p-[16px] rounded-[12px] border-2 cursor-pointer transition-all ${
                    selectedOptions.includes("photos")
                      ? "border-[#56C490] bg-[#F0FDF4]"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <div className="flex items-center gap-[12px] mb-[12px]">
                    <Image className="w-[20px] h-[20px] text-[#56C490]" />
                    <span className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                      Add photos
                    </span>
                    <span className="font-['Inter',sans-serif] text-[12px] text-[#9CA3AF]">
                      (Up to 5)
                    </span>
                  </div>

                  {selectedOptions.includes("photos") && (
                    <div className="pl-[32px]">
                      <div className="grid grid-cols-3 gap-[12px]">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-[12px] border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center cursor-pointer hover:border-[#56C490] transition-colors"
                          >
                            <Image className="w-[24px] h-[24px] text-[#9CA3AF]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="bg-[#DBEAFE] rounded-[16px] p-[16px] border border-[#93C5FD]">
              <div className="flex gap-[12px]">
                <Info className="w-[20px] h-[20px] text-[#1E40AF] flex-shrink-0 mt-[2px]" />
                <div>
                  <div className="font-['Nunito',sans-serif] text-[14px] text-[#1E40AF] mb-[4px]">
                    Provider Approval Required
                  </div>
                  <div className="font-['Inter',sans-serif] text-[12px] text-[#1E3A8A]">
                    Your modification request will be sent to the provider for approval. You'll be notified once they respond.
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Link */}
            <div className="text-center pt-[8px]">
              <button
                onClick={() => navigate(-1)}
                className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] active:scale-95 transition-transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <StickyFooterButton
          label="Request Modification"
          onClick={handleSubmit}
          disabled={selectedOptions.length === 0}
        />
      </div>
    </MobileContainer>
  );
}
