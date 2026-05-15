import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Phone, MessageCircle, MapPin, Clock, Star, Camera, DollarSign, AlertCircle, Navigation, Play, CheckCircle, Calendar, Image as ImageIcon, Send } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { useBooking } from "../contexts/BookingContext";

type BookingStatus = "pending" | "confirmed" | "onTheWay" | "arrived" | "inProgress" | "completed" | "cancelled";

interface BookingData {
  id: string;
  referenceNumber: string;
  status: BookingStatus;
  customer: {
    name: string;
    photo: string;
    rating: number;
    reviewCount: number;
    phone: string;
    phoneRevealed: boolean;
  };
  service: {
    type: string;
    date: string;
    time: string;
    location: {
      address: string;
      coordinates: { lat: number; lng: number };
    };
    description: string;
    specialInstructions: string;
    estimatedDuration: string;
    actualDuration: string | null;
    photos: string[];
  };
  pricing: {
    serviceFee: number;
    additionalCharges: number;
    platformFee: number;
    yourEarnings: number;
  };
  scheduledDate: string;
}

export default function ProviderBookingDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getBookingStatus } = useBooking();
  
  // Mock booking database
  const allBookings: Record<string, BookingData> = {
    "1": {
      id: "1",
      referenceNumber: "BK-2026-03-001",
      status: "confirmed",
      customer: {
        name: "Juan Dela Cruz",
        photo: "https://i.pravatar.cc/150?img=12",
        rating: 4.8,
        reviewCount: 24,
        phone: "+63 917 123 4556",
        phoneRevealed: true
      },
      service: {
        type: "Plumbing Repair",
        date: "March 15, 2026",
        time: "2:00 PM",
        location: {
          address: "123 Rizal Street, Brgy. Poblacion, Makati City, Metro Manila",
          coordinates: { lat: 14.5547, lng: 121.0244 }
        },
        description: "Kitchen sink is leaking badly. Water is dripping from the pipe underneath. Need urgent repair.",
        specialInstructions: "Please call when you arrive. Gate code is 1234.",
        estimatedDuration: "2 hours",
        actualDuration: null,
        photos: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400",
          "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400"
        ]
      },
      pricing: {
        serviceFee: 1500,
        additionalCharges: 0,
        platformFee: 150,
        yourEarnings: 1350
      },
      scheduledDate: "March 15, 2026"
    },
    "2": {
      id: "2",
      referenceNumber: "BK-2026-03-002",
      status: "pending",
      customer: {
        name: "Maria Santos",
        photo: "https://i.pravatar.cc/150?img=5",
        rating: 4.6,
        reviewCount: 18,
        phone: "+63 918 765 4389",
        phoneRevealed: false
      },
      service: {
        type: "Electrical Wiring",
        date: "March 16, 2026",
        time: "10:00 AM",
        location: {
          address: "456 Bonifacio Ave, Brgy. Fort Bonifacio, Taguig City, Metro Manila",
          coordinates: { lat: 14.5352, lng: 121.0463 }
        },
        description: "Need to install additional outlets in the living room and bedroom. Also check the circuit breaker.",
        specialInstructions: "Please bring extension cords. Building security requires ID.",
        estimatedDuration: "3 hours",
        actualDuration: null,
        photos: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400"
        ]
      },
      pricing: {
        serviceFee: 2300,
        additionalCharges: 0,
        platformFee: 230,
        yourEarnings: 2070
      },
      scheduledDate: "March 16, 2026"
    },
    "3": {
      id: "3",
      referenceNumber: "BK-2026-03-003",
      status: "confirmed",
      customer: {
        name: "Pedro Reyes",
        photo: "https://i.pravatar.cc/150?img=8",
        rating: 4.9,
        reviewCount: 32,
        phone: "+63 920 456 7890",
        phoneRevealed: true
      },
      service: {
        type: "Aircon Cleaning",
        date: "March 18, 2026",
        time: "3:30 PM",
        location: {
          address: "789 Luna Street, Brgy. San Isidro, Quezon City, Metro Manila",
          coordinates: { lat: 14.6091, lng: 121.0223 }
        },
        description: "2 split-type aircon units need cleaning. Last service was 6 months ago.",
        specialInstructions: "Units are in the master bedroom and living room.",
        estimatedDuration: "2 hours",
        actualDuration: null,
        photos: []
      },
      pricing: {
        serviceFee: 800,
        additionalCharges: 0,
        platformFee: 80,
        yourEarnings: 720
      },
      scheduledDate: "March 18, 2026"
    },
    "4": {
      id: "4",
      referenceNumber: "BK-2026-03-004",
      status: "inProgress",
      customer: {
        name: "Ana Garcia",
        photo: "https://i.pravatar.cc/150?img=9",
        rating: 4.7,
        reviewCount: 15,
        phone: "+63 918 234 5678",
        phoneRevealed: true
      },
      service: {
        type: "Home Cleaning",
        date: "March 13, 2026",
        time: "9:00 AM",
        location: {
          address: "321 Magallanes Street, Brgy. Magallanes, Manila, Metro Manila",
          coordinates: { lat: 14.5995, lng: 120.9842 }
        },
        description: "Full house cleaning - 3 bedrooms, 2 bathrooms, living room, kitchen, and dining area.",
        specialInstructions: "Bring your own cleaning supplies.",
        estimatedDuration: "4 hours",
        actualDuration: "2 hour 15 mins",
        photos: []
      },
      pricing: {
        serviceFee: 1200,
        additionalCharges: 0,
        platformFee: 120,
        yourEarnings: 1080
      },
      scheduledDate: "March 13, 2026"
    },
    "5": {
      id: "5",
      referenceNumber: "BK-2026-03-005",
      status: "completed",
      customer: {
        name: "Carlos Fernandez",
        photo: "https://i.pravatar.cc/150?img=13",
        rating: 5.0,
        reviewCount: 41,
        phone: "+63 917 890 1234",
        phoneRevealed: true
      },
      service: {
        type: "Painting Service",
        date: "March 10, 2026",
        time: "1:00 PM",
        location: {
          address: "555 Roxas Blvd, Brgy. Baclaran, Pasay City, Metro Manila",
          coordinates: { lat: 14.5378, lng: 121.0014 }
        },
        description: "Repaint bedroom walls - approximately 20 sqm. Color: off-white.",
        specialInstructions: "Customer will provide paint. Please cover furniture with plastic.",
        estimatedDuration: "5 hours",
        actualDuration: null,
        photos: []
      },
      pricing: {
        serviceFee: 3500,
        additionalCharges: 0,
        platformFee: 350,
        yourEarnings: 3150
      },
      scheduledDate: "March 10, 2026"
    },
    "6": {
      id: "6",
      referenceNumber: "BK-2026-03-006",
      status: "completed",
      customer: {
        name: "Lisa Martinez",
        photo: "https://i.pravatar.cc/150?img=10",
        rating: 4.5,
        reviewCount: 9,
        phone: "+63 919 345 6789",
        phoneRevealed: true
      },
      service: {
        type: "Plumbing Repair",
        date: "March 8, 2026",
        time: "11:00 AM",
        location: {
          address: "222 Katipunan Ave, Brgy. Loyola Heights, Quezon City, Metro Manila",
          coordinates: { lat: 14.6380, lng: 121.0770 }
        },
        description: "Toilet is clogged and shower head needs replacement.",
        specialInstructions: "Condo unit 5B. Please check in at lobby.",
        estimatedDuration: "1.5 hours",
        actualDuration: null,
        photos: []
      },
      pricing: {
        serviceFee: 1800,
        additionalCharges: 0,
        platformFee: 180,
        yourEarnings: 1620
      },
      scheduledDate: "March 8, 2026"
    },
    "7": {
      id: "7",
      referenceNumber: "BK-2026-03-007",
      status: "cancelled",
      customer: {
        name: "Roberto Cruz",
        photo: "https://i.pravatar.cc/150?img=7",
        rating: 3.8,
        reviewCount: 5,
        phone: "+63 920 567 8901",
        phoneRevealed: true
      },
      service: {
        type: "Carpentry Work",
        date: "March 5, 2026",
        time: "4:00 PM",
        location: {
          address: "888 EDSA, Brgy. Plainview, Mandaluyong City, Metro Manila",
          coordinates: { lat: 14.5794, lng: 121.0359 }
        },
        description: "Build custom bookshelf - dimensions provided in photos.",
        specialInstructions: "Wood material will be provided by customer.",
        estimatedDuration: "6 hours",
        actualDuration: null,
        photos: []
      },
      pricing: {
        serviceFee: 2000,
        additionalCharges: 0,
        platformFee: 200,
        yourEarnings: 1800
      },
      scheduledDate: "March 5, 2026"
    }
  };

  // Get booking by ID
  const initialBooking = allBookings[id || "1"] || allBookings["1"];
  
  // Check if there's a status update from the global context
  const globalStatus = getBookingStatus(id || "1");
  const initialStatus = globalStatus || initialBooking.status;
  
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>(initialStatus);
  const [showAdditionalCharges, setShowAdditionalCharges] = useState(false);
  
  // Dynamically compute phone reveal status based on booking status
  const isPhoneRevealed = bookingStatus !== "pending";
  
  // Function to mask phone number
  const getMaskedPhone = (phone: string) => {
    const lastTwo = phone.slice(-2);
    return `••• •••• ••${lastTwo}`;
  };
  
  // Get displayed phone number based on reveal status
  const displayedPhone = isPhoneRevealed ? initialBooking.customer.phone : getMaskedPhone(initialBooking.customer.phone);
  
  const booking = {
    ...initialBooking,
    status: bookingStatus,
    customer: {
      ...initialBooking.customer,
      phone: displayedPhone,
      phoneRevealed: isPhoneRevealed
    },
    service: {
      ...initialBooking.service,
      actualDuration: bookingStatus === "inProgress" ? initialBooking.service.actualDuration || "1 hour 23 mins" : null
    }
  };

  const statusConfig: Record<BookingStatus, { label: string; color: string; bgColor: string }> = {
    pending: { label: "Pending Confirmation", color: "#F59E0B", bgColor: "#FEF3C7" },
    confirmed: { label: "Confirmed", color: "#56C490", bgColor: "#D1FAE5" },
    onTheWay: { label: "On the Way", color: "#3B82F6", bgColor: "#DBEAFE" },
    arrived: { label: "Arrived", color: "#8B5CF6", bgColor: "#EDE9FE" },
    inProgress: { label: "In Progress", color: "#3B82F6", bgColor: "#DBEAFE" },
    completed: { label: "Completed", color: "#6B7280", bgColor: "#F3F4F6" },
    cancelled: { label: "Cancelled", color: "#EF4444", bgColor: "#FEE2E2" }
  };

  const progressSteps = [
    { key: "confirmed", label: "Confirmed", icon: CheckCircle },
    { key: "onTheWay", label: "On the Way", icon: Navigation },
    { key: "arrived", label: "Arrived", icon: MapPin },
    { key: "inProgress", label: "In Progress", icon: Play },
    { key: "completed", label: "Completed", icon: CheckCircle }
  ];

  const getCurrentStepIndex = () => {
    const order: BookingStatus[] = ["confirmed", "onTheWay", "arrived", "inProgress", "completed"];
    return order.indexOf(bookingStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  const isToday = booking.scheduledDate === "March 15, 2026"; // Mock check

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Fixed Header */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0 border-b border-[#f2f2f2] relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90 relative z-20"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Booking Details
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        {/* Reference Number & Status */}
        <div className="mt-[24px] mb-[20px]">
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#9CA3AF] mb-[12px]">
            {booking.referenceNumber}
          </p>
          <div
            className="inline-flex px-[16px] py-[10px] rounded-[12px]"
            style={{ backgroundColor: statusConfig[bookingStatus].bgColor }}
          >
            <p
              className="font-['Nunito',sans-serif] text-[16px]"
              style={{ color: statusConfig[bookingStatus].color }}
            >
              {statusConfig[bookingStatus].label}
            </p>
          </div>
        </div>

        {/* Progress Timeline */}
        {bookingStatus !== "cancelled" && bookingStatus !== "pending" && (
          <div className="mb-[32px]">
            <div className="flex items-center justify-between">
              {progressSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      {index > 0 && (
                        <div
                          className={`h-[2px] flex-1 transition-all ${
                            index <= currentStepIndex ? "bg-[#56C490]" : "bg-[#e5e5e5]"
                          }`}
                        />
                      )}
                      <div
                        className={`w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all ${
                          isActive ? "bg-[#56C490]" : "bg-[#f5f5f5]"
                        } ${isCurrent ? "ring-4 ring-[#56C490]/20" : ""}`}
                      >
                        <Icon
                          className={`w-[20px] h-[20px] ${
                            isActive ? "text-white" : "text-[#9CA3AF]"
                          }`}
                        />
                      </div>
                      {index < progressSteps.length - 1 && (
                        <div
                          className={`h-[2px] flex-1 transition-all ${
                            index < currentStepIndex ? "bg-[#56C490]" : "bg-[#e5e5e5]"
                          }`}
                        />
                      )}
                    </div>
                    <p
                      className={`font-['Nunito',sans-serif] text-[10px] mt-[6px] text-center ${
                        isActive ? "text-[#1a1a1a]" : "text-[#9CA3AF]"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Customer Card */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[20px]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[12px]">
            Customer
          </p>
          <div className="flex items-start gap-[12px] mb-[16px]">
            <img
              src={booking.customer.photo}
              alt={booking.customer.name}
              className="w-[60px] h-[60px] rounded-full object-cover border-2 border-[#f5f5f5]"
            />
            <div className="flex-1">
              <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#1a1a1a] mb-[4px]">
                {booking.customer.name}
              </h3>
              <div className="flex items-center gap-[4px] mb-[6px]">
                <Star className="w-[14px] h-[14px] fill-[#F59E0B] text-[#F59E0B]" />
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#1a1a1a]">
                  {booking.customer.rating}
                </p>
                <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                  ({booking.customer.reviewCount} reviews)
                </p>
              </div>
              <div className="flex items-center gap-[6px]">
                <Phone className="w-[14px] h-[14px] text-[#666]" />
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#666]">
                  {booking.customer.phone}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-[8px]">
            <button
              disabled={!booking.customer.phoneRevealed}
              className="px-[12px] py-[10px] bg-[#56C490] text-white font-['Nunito',sans-serif] text-[13px] rounded-[10px] transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-[6px]"
            >
              <Phone className="w-[16px] h-[16px]" />
              Call
            </button>
            <button 
              onClick={() => navigate(`/provider/messages/${id}`)}
              className="px-[12px] py-[10px] border-2 border-[#56C490] text-[#56C490] font-['Nunito',sans-serif] text-[13px] rounded-[10px] transition-all active:scale-95 flex items-center justify-center gap-[6px]"
            >
              <MessageCircle className="w-[16px] h-[16px]" />
              Message
            </button>
          </div>
        </div>

        {/* Service Details */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[20px]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[12px]">
            Service Details
          </p>
          
          <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#1a1a1a] mb-[12px]">
            {booking.service.type}
          </h3>

          <div className="space-y-[12px] mb-[16px]">
            <div className="flex items-center gap-[8px]">
              <Calendar className="w-[16px] h-[16px] text-[#666]" />
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#666]">
                {booking.service.date} at {booking.service.time}
              </p>
            </div>
            <div className="flex items-center gap-[8px]">
              <Clock className="w-[16px] h-[16px] text-[#666]" />
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#666]">
                Est. Duration: {booking.service.estimatedDuration}
              </p>
            </div>
            {booking.service.actualDuration && (
              <div className="flex items-center gap-[8px]">
                <Clock className="w-[16px] h-[16px] text-[#56C490]" />
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
                  Actual Duration: {booking.service.actualDuration}
                </p>
              </div>
            )}
          </div>

          {/* Location Placeholder */}
          <div className="mb-[12px]">
            <div className="rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5] h-[150px] flex flex-col items-center justify-center">
              <MapPin className="w-[40px] h-[40px] text-[#9CA3AF] mb-[8px]" />
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
                Location Map
              </p>
            </div>
          </div>

          <div className="flex items-start gap-[8px] mb-[16px]">
            <MapPin className="w-[16px] h-[16px] text-[#666] flex-shrink-0 mt-[2px]" />
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#666] flex-1">
              {booking.service.location.address}
            </p>
          </div>

          {/* Description */}
          <div className="mb-[12px]">
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#374151] mb-[6px]">
              Description
            </p>
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#666] leading-relaxed">
              {booking.service.description}
            </p>
          </div>

          {/* Special Instructions */}
          {booking.service.specialInstructions && (
            <div className="bg-[#FEF3C7] border border-[#F59E0B]/20 rounded-[10px] p-[12px] mb-[12px]">
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#92400E] mb-[4px]">
                Special Instructions
              </p>
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#78350F]">
                {booking.service.specialInstructions}
              </p>
            </div>
          )}

          {/* Service Photos */}
          {booking.service.photos && booking.service.photos.length > 0 && (
            <div>
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#374151] mb-[8px]">
                Photos
              </p>
              <div className="grid grid-cols-2 gap-[8px]">
                {booking.service.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Service photo ${index + 1}`}
                    className="w-full h-[100px] object-cover rounded-[10px] border border-[#e5e5e5]"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Breakdown */}
        <div className="border-2 border-[#e5e5e5] rounded-[16px] p-[16px] mb-[20px]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[12px]">
            Pricing Breakdown
          </p>
          
          <div className="space-y-[12px]">
            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#666]">
                Service Fee
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                ₱{booking.pricing.serviceFee.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#666]">
                Additional Charges
              </p>
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                ₱{booking.pricing.additionalCharges.toLocaleString()}
              </p>
            </div>
            <div className="border-t border-[#f2f2f2] pt-[12px]">
              <div className="flex items-center justify-between mb-[8px]">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#666]">
                  Platform Fee (10%)
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#EF4444]">
                  -₱{booking.pricing.platformFee.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between bg-[#56C490]/10 rounded-[10px] p-[12px]">
                <p className="font-['Nunito',sans-serif] text-[15px] text-[#56C490]">
                  Your Earnings
                </p>
                <p className="font-['Nunito',sans-serif] text-[18px] text-[#56C490]">
                  ₱{booking.pricing.yourEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-[8px] mb-[20px]">
          {/* Context-specific buttons based on status */}
          {bookingStatus === "confirmed" && (
            <button
              onClick={() => {
                setBookingStatus("onTheWay");
                navigate(`/provider/navigation-mode/${id}`);
              }}
              className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] flex items-center justify-center gap-[8px]"
            >
              <Navigation className="w-[18px] h-[18px]" />
              Start Trip
            </button>
          )}

          {bookingStatus === "onTheWay" && (
            <button
              onClick={() => setBookingStatus("arrived")}
              className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] flex items-center justify-center gap-[8px]"
            >
              <MapPin className="w-[18px] h-[18px]" />
              I've Arrived
            </button>
          )}

          {bookingStatus === "arrived" && (
            <button
              onClick={() => setBookingStatus("inProgress")}
              className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] flex items-center justify-center gap-[8px]"
            >
              <Play className="w-[18px] h-[18px]" />
              Start Service
            </button>
          )}

          {bookingStatus === "inProgress" && (
            <>
              <button className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] flex items-center justify-center gap-[8px]"
              >
                <Camera className="w-[18px] h-[18px]" />
                Upload Progress Photos
              </button>
              <button 
                onClick={() => navigate(`/provider/additional-charges/${id}`)}
                className="w-full bg-white border-2 border-[#56C490] text-[#56C490] font-['Nunito',sans-serif] text-[15px] py-[12px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[8px]"
              >
                <DollarSign className="w-[18px] h-[18px]" />
                Add Additional Charges
              </button>
              <button
                onClick={() => setBookingStatus("completed")}
                className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[12px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(86,196,144,0.25)] flex items-center justify-center gap-[8px]"
              >
                <CheckCircle className="w-[18px] h-[18px]" />
                Complete Service
              </button>
            </>
          )}

          {bookingStatus === "confirmed" && (
            <button 
              onClick={() => navigate(`/provider/additional-charges/${id}`)}
              className="w-full bg-white border-2 border-[#56C490] text-[#56C490] font-['Nunito',sans-serif] text-[15px] py-[12px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[8px]"
            >
              <DollarSign className="w-[18px] h-[18px]" />
              Add Additional Charges
            </button>
          )}

          {(bookingStatus === "confirmed" || bookingStatus === "onTheWay") && (
            <>
              <button 
                onClick={() => navigate(`/provider/reschedule/${id}`)}
                className="w-full bg-white border-2 border-[#e5e5e5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[14px] py-[12px] rounded-[12px] transition-all active:scale-95"
              >
                Request Reschedule
              </button>
              <button 
                onClick={() => navigate(`/provider/cancel-booking/${id}`)}
                className="w-full bg-white border-2 border-[#EF4444] text-[#EF4444] font-['Nunito',sans-serif] text-[14px] py-[12px] rounded-[12px] transition-all active:scale-95"
              >
                Cancel Booking
              </button>
            </>
          )}
        </div>

        {/* Report Issue Button */}
        <button 
          onClick={() => navigate(`/provider/booking/${id}/report-issue`)}
          className="w-full bg-white border-2 border-[#e5e5e5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[14px] py-[12px] rounded-[12px] transition-all active:scale-95 flex items-center justify-center gap-[8px]"
        >
          <AlertCircle className="w-[16px] h-[16px]" />
          Report Issue
        </button>
      </div>

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}