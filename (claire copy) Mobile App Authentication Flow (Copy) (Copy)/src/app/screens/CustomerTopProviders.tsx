import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, Search, Star, MapPin, CheckCircle } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

// Top-rated providers data
const topProviders = [
  {
    id: 1,
    name: "John Martinez",
    rating: 4.9,
    reviews: 127,
    specialty: "Plumbing",
    completedJobs: 245,
    location: "Makati City",
    verified: true,
    avatar: "JM"
  },
  {
    id: 2,
    name: "Sarah Chen",
    rating: 4.8,
    reviews: 98,
    specialty: "Cleaning",
    completedJobs: 189,
    location: "Quezon City",
    verified: true,
    avatar: "SC"
  },
  {
    id: 3,
    name: "Mike Torres",
    rating: 5.0,
    reviews: 156,
    specialty: "Electrical",
    completedJobs: 312,
    location: "Pasig City",
    verified: true,
    avatar: "MT"
  },
  {
    id: 4,
    name: "Lisa Anderson",
    rating: 4.7,
    reviews: 84,
    specialty: "Painting",
    completedJobs: 167,
    location: "Taguig City",
    verified: true,
    avatar: "LA"
  },
  {
    id: 5,
    name: "Carlos Rivera",
    rating: 4.9,
    reviews: 112,
    specialty: "Carpentry",
    completedJobs: 201,
    location: "Manila",
    verified: true,
    avatar: "CR"
  },
  {
    id: 6,
    name: "Emma Watson",
    rating: 4.8,
    reviews: 91,
    specialty: "Gardening",
    completedJobs: 156,
    location: "Parañaque",
    verified: true,
    avatar: "EW"
  },
  {
    id: 7,
    name: "David Kim",
    rating: 4.9,
    reviews: 143,
    specialty: "Aircon Repair",
    completedJobs: 278,
    location: "Mandaluyong",
    verified: true,
    avatar: "DK"
  },
  {
    id: 8,
    name: "Maria Santos",
    rating: 5.0,
    reviews: 189,
    specialty: "House Cleaning",
    completedJobs: 356,
    location: "Caloocan",
    verified: true,
    avatar: "MS"
  },
  {
    id: 9,
    name: "Robert Lee",
    rating: 4.8,
    reviews: 76,
    specialty: "Pest Control",
    completedJobs: 134,
    location: "Las Piñas",
    verified: true,
    avatar: "RL"
  },
  {
    id: 10,
    name: "Jennifer Cruz",
    rating: 4.9,
    reviews: 134,
    specialty: "Interior Design",
    completedJobs: 198,
    location: "Pasay City",
    verified: true,
    avatar: "JC"
  },
  {
    id: 11,
    name: "Antonio Reyes",
    rating: 4.7,
    reviews: 102,
    specialty: "Roofing",
    completedJobs: 167,
    location: "Valenzuela",
    verified: true,
    avatar: "AR"
  },
  {
    id: 12,
    name: "Grace Lim",
    rating: 4.9,
    reviews: 165,
    specialty: "Massage Therapy",
    completedJobs: 289,
    location: "Muntinlupa",
    verified: true,
    avatar: "GL"
  },
  {
    id: 13,
    name: "Daniel Garcia",
    rating: 4.8,
    reviews: 123,
    specialty: "Appliance Repair",
    completedJobs: 234,
    location: "Marikina",
    verified: true,
    avatar: "DG"
  },
  {
    id: 14,
    name: "Patricia Tan",
    rating: 5.0,
    reviews: 198,
    specialty: "Tutoring",
    completedJobs: 412,
    location: "San Juan",
    verified: true,
    avatar: "PT"
  },
  {
    id: 15,
    name: "Vincent Aquino",
    rating: 4.9,
    reviews: 145,
    specialty: "Locksmith",
    completedJobs: 267,
    location: "Makati City",
    verified: true,
    avatar: "VA"
  },
  {
    id: 16,
    name: "Angela Lopez",
    rating: 4.8,
    reviews: 87,
    specialty: "Pet Grooming",
    completedJobs: 178,
    location: "Quezon City",
    verified: true,
    avatar: "AL"
  }
];

export default function CustomerTopProviders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter providers based on search query
  const filteredProviders = topProviders.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] py-[12px] flex items-center gap-[16px] border-b border-[#F2F2F2] flex-shrink-0">
        <button
          onClick={() => navigate("/customer/home")}
          className="w-[40px] h-[40px] flex items-center justify-center -ml-[8px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
        </button>
        <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
          Top-rated Providers
        </h1>
      </div>

      {/* Search Bar */}
      <div className="px-[24px] py-[16px] bg-white border-b border-[#F2F2F2] flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, service, or location..."
            className="w-full pl-[48px] pr-[16px] py-[12px] rounded-[12px] bg-[#F9FAFB] border border-[#E5E7EB] font-['Nunito',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20 transition-all"
          />
        </div>
      </div>

      {/* Providers List */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        <div className="px-[24px] py-[20px]">
          {filteredProviders.length === 0 ? (
            <div className="text-center py-[60px]">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#9CA3AF] mb-[8px]">
                No providers found
              </p>
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                Try searching with different keywords
              </p>
            </div>
          ) : (
            <div className="space-y-[16px]">
              {filteredProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => navigate(`/customer/provider/${provider.id}`)}
                  className="w-full bg-white rounded-[16px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all active:scale-[0.98] flex items-center gap-[16px]"
                >
                  {/* Provider Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#56C490] to-[#00a055] flex items-center justify-center">
                      <span className="font-['Nunito',sans-serif] text-[28px] text-white">
                        {provider.avatar}
                      </span>
                    </div>
                    {provider.verified && (
                      <div className="absolute bottom-0 right-0 w-[20px] h-[20px] bg-[#56C490] rounded-full flex items-center justify-center border-2 border-white">
                        <CheckCircle className="w-[12px] h-[12px] text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Provider Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-[6px] mb-[4px]">
                      <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
                        {provider.name}
                      </h3>
                    </div>

                    <p className="font-['Nunito',sans-serif] text-[13px] text-[#56C490] mb-[6px]">
                      {provider.specialty}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-[6px] mb-[6px]">
                      <Star className="w-[14px] h-[14px] text-[#FFC107] fill-[#FFC107]" />
                      <span className="font-['Nunito',sans-serif] text-[13px] text-[#111827]">
                        {provider.rating}
                      </span>
                      <span className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                        ({provider.reviews} reviews)
                      </span>
                    </div>

                    {/* Location & Jobs */}
                    <div className="flex items-center gap-[12px] text-[11px]">
                      <div className="flex items-center gap-[4px]">
                        <MapPin className="w-[12px] h-[12px] text-[#9CA3AF]" />
                        <span className="font-['Nunito',sans-serif] text-[#6B7280]">
                          {provider.location}
                        </span>
                      </div>
                      <div className="w-[1px] h-[12px] bg-[#E5E7EB]" />
                      <span className="font-['Nunito',sans-serif] text-[#6B7280]">
                        {provider.completedJobs} jobs completed
                      </span>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex-shrink-0">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#F9FAFB] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 12L10 8L6 4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
