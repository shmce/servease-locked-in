import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  X,
  Home,
  Calendar,
  MessageCircle,
  User,
  Repeat,
  History,
  MapPinned,
  Clock,
  ChevronRight,
} from "lucide-react";

interface Provider {
  id: number;
  name: string;
  photo: string;
  service: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location: string;
  distance: string;
  isVerified: boolean;
  completedJobs: number;
}

interface RecentProvider {
  id: number;
  name: string;
  photo: string;
  service: string;
  lastBooked: string;
}

interface Booking {
  id: number;
  service: string;
  provider: string;
  date: string;
  status: string;
}

export default function CustomerProviderSearch() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedService, setSelectedService] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState("rating");

  const allProviders: Provider[] = [
    {
      id: 101,
      name: "Maria Santos",
      photo: "https://i.pravatar.cc/150?img=5",
      service: "House Cleaning",
      rating: 4.9,
      reviewCount: 156,
      hourlyRate: 350,
      location: "Makati City",
      distance: "2.5 km",
      isVerified: true,
      completedJobs: 234,
    },
    {
      id: 102,
      name: "Juan Dela Cruz",
      photo: "https://i.pravatar.cc/150?img=12",
      service: "Plumbing",
      rating: 4.8,
      reviewCount: 132,
      hourlyRate: 450,
      location: "Quezon City",
      distance: "3.8 km",
      isVerified: true,
      completedJobs: 198,
    },
    {
      id: 103,
      name: "Ana Reyes",
      photo: "https://i.pravatar.cc/150?img=9",
      service: "Electrical Work",
      rating: 4.7,
      reviewCount: 98,
      hourlyRate: 500,
      location: "Pasig City",
      distance: "4.2 km",
      isVerified: true,
      completedJobs: 156,
    },
    {
      id: 104,
      name: "Carlos Mendoza",
      photo: "https://i.pravatar.cc/150?img=13",
      service: "Aircon Service",
      rating: 4.9,
      reviewCount: 201,
      hourlyRate: 600,
      location: "Mandaluyong",
      distance: "1.8 km",
      isVerified: true,
      completedJobs: 287,
    },
    {
      id: 105,
      name: "Sofia Garcia",
      photo: "https://i.pravatar.cc/150?img=10",
      service: "Appliance Repair",
      rating: 4.6,
      reviewCount: 87,
      hourlyRate: 400,
      location: "Taguig City",
      distance: "5.1 km",
      isVerified: false,
      completedJobs: 134,
    },
    {
      id: 106,
      name: "Roberto Cruz",
      photo: "https://i.pravatar.cc/150?img=14",
      service: "House Cleaning",
      rating: 4.8,
      reviewCount: 143,
      hourlyRate: 320,
      location: "Makati City",
      distance: "2.1 km",
      isVerified: true,
      completedJobs: 189,
    },
  ];

  const recentProviders: RecentProvider[] = [
    {
      id: 101,
      name: "Maria Santos",
      photo: "https://i.pravatar.cc/150?img=5",
      service: "House Cleaning",
      lastBooked: "2 days ago",
    },
    {
      id: 102,
      name: "Juan Dela Cruz",
      photo: "https://i.pravatar.cc/150?img=12",
      service: "Plumbing",
      lastBooked: "5 days ago",
    },
    {
      id: 104,
      name: "Carlos Mendoza",
      photo: "https://i.pravatar.cc/150?img=13",
      service: "Aircon Service",
      lastBooked: "1 week ago",
    },
  ];

  const upcomingBookings: Booking[] = [
    {
      id: 1,
      service: "House Cleaning",
      provider: "Maria Santos",
      date: "Today, 2:00 PM",
      status: "Confirmed",
    },
    {
      id: 2,
      service: "Plumbing Repair",
      provider: "Juan Dela Cruz",
      date: "Tomorrow, 10:00 AM",
      status: "Pending",
    },
  ];

  const services = [
    "All",
    "House Cleaning",
    "Plumbing",
    "Electrical Work",
    "Aircon Service",
    "Appliance Repair",
  ];

  const filteredProviders = allProviders
    .filter((provider) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesService =
        selectedService === "All" || provider.service === selectedService;
      const matchesRating = provider.rating >= minRating;
      const matchesPrice = provider.hourlyRate <= maxPrice;

      return matchesSearch && matchesService && matchesRating && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price-low") return a.hourlyRate - b.hourlyRate;
      if (sortBy === "price-high") return b.hourlyRate - a.hourlyRate;
      if (sortBy === "distance")
        return parseFloat(a.distance) - parseFloat(b.distance);
      return 0;
    });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    if (tab === "home") {
      navigate("/customer/home");
    } else if (tab === "bookings") {
      navigate("/customer/projects");
    } else if (tab === "messages") {
      navigate("/customer/messages");
    } else if (tab === "profile") {
      navigate("/customer/more");
    }
  };

  const isSearchActive = searchQuery.trim() !== "" || selectedService !== "All" || minRating > 0 || maxPrice < 1000;

  return (
    <div className="bg-[#F5F7FA] w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] py-[16px] border-b border-[#E5E7EB] flex-shrink-0">
        <h1 className="text-[#111827] text-[18px] font-semibold mb-[16px]">
          Explore
        </h1>

        {/* Search Bar */}
        <div className="flex gap-[12px]">
          <div className="flex-1 relative">
            <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by name, service, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-[40px] pr-[16px] py-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] rounded-full bg-[#E5E7EB] flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-[12px] h-[12px] text-[#6B7280]" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="w-[44px] h-[44px] rounded-[10px] bg-[#56C490] flex items-center justify-center shadow-[0_2px_8px_rgba(86,196,144,0.25)] transition-all active:scale-90 relative"
          >
            <SlidersHorizontal className="w-[20px] h-[20px] text-white" />
            {(selectedService !== "All" || minRating > 0 || maxPrice < 1000) && (
              <div className="absolute top-[6px] right-[6px] w-[8px] h-[8px] bg-[#FF6B6B] rounded-full border-2 border-white" />
            )}
          </button>
        </div>

        {/* Active Filters */}
        {(selectedService !== "All" || minRating > 0 || maxPrice < 1000) && (
          <div className="flex flex-wrap gap-[8px] mt-[12px]">
            {selectedService !== "All" && (
              <div className="bg-[#56C490]/10 px-[12px] py-[6px] rounded-[6px] flex items-center gap-[6px]">
                <span className="text-[#56C490] text-[12px] font-medium">
                  {selectedService}
                </span>
                <button onClick={() => setSelectedService("All")}>
                  <X className="w-[14px] h-[14px] text-[#56C490]" />
                </button>
              </div>
            )}
            {minRating > 0 && (
              <div className="bg-[#56C490]/10 px-[12px] py-[6px] rounded-[6px] flex items-center gap-[6px]">
                <span className="text-[#56C490] text-[12px] font-medium">
                  {minRating}+ stars
                </span>
                <button onClick={() => setMinRating(0)}>
                  <X className="w-[14px] h-[14px] text-[#56C490]" />
                </button>
              </div>
            )}
            {maxPrice < 1000 && (
              <div className="bg-[#56C490]/10 px-[12px] py-[6px] rounded-[6px] flex items-center gap-[6px]">
                <span className="text-[#56C490] text-[12px] font-medium">
                  Up to ₱{maxPrice}
                </span>
                <button onClick={() => setMaxPrice(1000)}>
                  <X className="w-[14px] h-[14px] text-[#56C490]" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        {!isSearchActive ? (
          <>
            {/* Quick Actions */}
            <div className="px-[24px] pt-[20px] pb-[16px]">
              <div className="grid grid-cols-3 gap-[12px]">
                <button
                  onClick={() => navigate("/customer/projects")}
                  className="bg-white rounded-[12px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all active:scale-95 flex flex-col items-center gap-[8px]"
                >
                  <div className="w-[48px] h-[48px] rounded-full bg-[#56C490]/10 flex items-center justify-center">
                    <Repeat className="w-[24px] h-[24px] text-[#56C490]" />
                  </div>
                  <span className="text-[#111827] text-[12px] font-medium text-center">
                    Book Again
                  </span>
                </button>

                <button
                  onClick={() => navigate("/customer/projects")}
                  className="bg-white rounded-[12px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all active:scale-95 flex flex-col items-center gap-[8px]"
                >
                  <div className="w-[48px] h-[48px] rounded-full bg-[#56C490]/10 flex items-center justify-center">
                    <History className="w-[24px] h-[24px] text-[#56C490]" />
                  </div>
                  <span className="text-[#111827] text-[12px] font-medium text-center">
                    View History
                  </span>
                </button>

                <button
                  onClick={() => navigate("/customer/projects")}
                  className="bg-white rounded-[12px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all active:scale-95 flex flex-col items-center gap-[8px]"
                >
                  <div className="w-[48px] h-[48px] rounded-full bg-[#56C490]/10 flex items-center justify-center">
                    <MapPinned className="w-[24px] h-[24px] text-[#56C490]" />
                  </div>
                  <span className="text-[#111827] text-[12px] font-medium text-center">
                    Track Service
                  </span>
                </button>
              </div>
            </div>

            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div className="px-[24px] pb-[16px]">
                <div className="flex items-center justify-between mb-[12px]">
                  <h2 className="text-[#111827] text-[16px] font-semibold">
                    Upcoming Bookings
                  </h2>
                  <button
                    onClick={() => navigate("/customer/projects")}
                    className="text-[#56C490] text-[14px] font-semibold transition-all active:opacity-70"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-[8px]">
                  {upcomingBookings.map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => navigate(`/customer/project/${booking.id}`)}
                      className="w-full bg-white rounded-[12px] p-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all active:scale-[0.98] flex items-center gap-[12px]"
                    >
                      <div className="w-[48px] h-[48px] rounded-[10px] bg-[#56C490]/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-[24px] h-[24px] text-[#56C490]" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="text-[#111827] text-[14px] font-semibold truncate">
                          {booking.service}
                        </h3>
                        <p className="text-[#6B7280] text-[12px] truncate">
                          {booking.provider}
                        </p>
                        <p className="text-[#9CA3AF] text-[11px]">
                          {booking.date}
                        </p>
                      </div>
                      <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF] flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Providers */}
            <div className="px-[24px] pb-[16px]">
              <h2 className="text-[#111827] text-[16px] font-semibold mb-[12px]">
                Recent Providers
              </h2>
              <div className="flex gap-[12px] overflow-x-auto scrollbar-hide pb-[4px]">
                {recentProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => navigate(`/customer/provider/${provider.id}`)}
                    className="flex-shrink-0 w-[120px] bg-white rounded-[12px] p-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all active:scale-95"
                  >
                    <img
                      src={provider.photo}
                      alt={provider.name}
                      className="w-[96px] h-[96px] rounded-[10px] object-cover mb-[8px]"
                    />
                    <h3 className="text-[#111827] text-[13px] font-semibold truncate">
                      {provider.name}
                    </h3>
                    <p className="text-[#6B7280] text-[11px] truncate mb-[4px]">
                      {provider.service}
                    </p>
                    <p className="text-[#9CA3AF] text-[10px] truncate">
                      {provider.lastBooked}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Browse Categories */}
            <div className="px-[24px] pb-[16px]">
              <h2 className="text-[#111827] text-[16px] font-semibold mb-[12px]">
                Browse by Service
              </h2>
              <div className="grid grid-cols-2 gap-[12px]">
                {services
                  .filter((s) => s !== "All")
                  .map((service) => (
                    <button
                      key={service}
                      onClick={() => {
                        setSelectedService(service);
                        setSearchQuery("");
                      }}
                      className="bg-white rounded-[12px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all active:scale-95 text-left"
                    >
                      <h3 className="text-[#111827] text-[14px] font-semibold mb-[4px]">
                        {service}
                      </h3>
                      <p className="text-[#6B7280] text-[12px]">
                        {
                          allProviders.filter((p) => p.service === service)
                            .length
                        }{" "}
                        providers
                      </p>
                    </button>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Results Count & Sort */}
            <div className="bg-white px-[24px] py-[12px] border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
              <p className="text-[#6B7280] text-[14px]">
                {filteredProviders.length} provider
                {filteredProviders.length !== 1 ? "s" : ""} found
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-[12px] py-[6px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[13px] text-[#111827] focus:outline-none focus:border-[#56C490]"
              >
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="distance">Nearest First</option>
              </select>
            </div>

            {/* Providers List */}
            {filteredProviders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-[24px] py-[40px]">
                <div className="w-[80px] h-[80px] rounded-full bg-[#F3F4F6] flex items-center justify-center mb-[16px]">
                  <Search className="w-[36px] h-[36px] text-[#9CA3AF]" />
                </div>
                <h3 className="text-[#111827] text-[16px] font-semibold mb-[8px]">
                  No providers found
                </h3>
                <p className="text-[#6B7280] text-[14px] text-center mb-[16px]">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedService("All");
                    setMinRating(0);
                    setMaxPrice(1000);
                  }}
                  className="bg-[#56C490] text-white font-semibold text-[14px] px-[24px] py-[10px] rounded-[10px] shadow-[0_2px_8px_rgba(86,196,144,0.25)] transition-all active:scale-95"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="px-[24px] pt-[16px] space-y-[12px]">
                {filteredProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => navigate(`/customer/provider/${provider.id}`)}
                    className="w-full bg-white rounded-[12px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all active:scale-[0.98] text-left"
                  >
                    <div className="flex gap-[12px]">
                      {/* Provider Photo */}
                      <img
                        src={provider.photo}
                        alt={provider.name}
                        className="w-[64px] h-[64px] rounded-[10px] object-cover flex-shrink-0"
                      />

                      {/* Provider Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-[4px]">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-[6px]">
                              <h3 className="text-[#111827] text-[15px] font-semibold truncate">
                                {provider.name}
                              </h3>
                              {provider.isVerified && (
                                <div className="w-[16px] h-[16px] rounded-full bg-[#56C490] flex items-center justify-center flex-shrink-0">
                                  <svg
                                    className="w-[10px] h-[10px] text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <p className="text-[#6B7280] text-[13px] truncate">
                              {provider.service}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-[8px]">
                            <p className="text-[#56C490] text-[16px] font-bold">
                              ₱{provider.hourlyRate}
                            </p>
                            <p className="text-[#9CA3AF] text-[11px]">/hour</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-[12px] mb-[6px]">
                          <div className="flex items-center gap-[4px]">
                            <Star
                              className="w-[14px] h-[14px] text-[#FFB800]"
                              fill="#FFB800"
                            />
                            <span className="text-[#111827] text-[13px] font-medium">
                              {provider.rating}
                            </span>
                            <span className="text-[#9CA3AF] text-[13px]">
                              ({provider.reviewCount})
                            </span>
                          </div>
                          <div className="w-[1px] h-[12px] bg-[#E5E7EB]" />
                          <span className="text-[#6B7280] text-[13px]">
                            {provider.completedJobs} jobs
                          </span>
                        </div>

                        <div className="flex items-center gap-[4px]">
                          <MapPin className="w-[14px] h-[14px] text-[#9CA3AF]" />
                          <span className="text-[#6B7280] text-[12px]">
                            {provider.location} • {provider.distance}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-[20px] py-[8px] flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleTabChange("home")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <Home
              className={`w-[24px] h-[24px] ${
                activeTab === "home" ? "text-[#56C490]" : "text-[#9CA3AF]"
              }`}
              fill={activeTab === "home" ? "#56C490" : "none"}
            />
            <span
              className={`text-[11px] ${
                activeTab === "home"
                  ? "text-[#56C490] font-semibold"
                  : "text-[#9CA3AF]"
              }`}
            >
              Home
            </span>
          </button>

          <button
            onClick={() => handleTabChange("bookings")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <Calendar
              className={`w-[24px] h-[24px] ${
                activeTab === "bookings" ? "text-[#56C490]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] ${
                activeTab === "bookings"
                  ? "text-[#56C490] font-semibold"
                  : "text-[#9CA3AF]"
              }`}
            >
              Bookings
            </span>
          </button>

          <button
            onClick={() => handleTabChange("messages")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <MessageCircle
              className={`w-[24px] h-[24px] ${
                activeTab === "messages" ? "text-[#56C490]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] ${
                activeTab === "messages"
                  ? "text-[#56C490] font-semibold"
                  : "text-[#9CA3AF]"
              }`}
            >
              Messages
            </span>
          </button>

          <button
            onClick={() => handleTabChange("profile")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <User
              className={`w-[24px] h-[24px] ${
                activeTab === "profile" ? "text-[#56C490]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] ${
                activeTab === "profile"
                  ? "text-[#56C490] font-semibold"
                  : "text-[#9CA3AF]"
              }`}
            >
              Profile
            </span>
          </button>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="fixed bottom-0 left-0 right-0 h-[34px] bg-white flex-shrink-0 pointer-events-none">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-[24px] w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-[24px] py-[16px] border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-[#111827] text-[18px] font-semibold">
                Filters
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all active:scale-90 hover:bg-[#F3F4F6]"
              >
                <X className="w-[20px] h-[20px] text-[#6B7280]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-[24px] py-[20px] overflow-y-auto max-h-[60vh]">
              {/* Service Type */}
              <div className="mb-[24px]">
                <h4 className="text-[#111827] text-[14px] font-semibold mb-[12px]">
                  Service Type
                </h4>
                <div className="flex flex-wrap gap-[8px]">
                  {services.map((service) => (
                    <button
                      key={service}
                      onClick={() => setSelectedService(service)}
                      className={`px-[16px] py-[8px] rounded-[8px] text-[13px] transition-all ${
                        selectedService === service
                          ? "bg-[#56C490] text-white"
                          : "bg-[#F9FAFB] text-[#111827] hover:bg-[#F3F4F6]"
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="mb-[24px]">
                <h4 className="text-[#111827] text-[14px] font-semibold mb-[12px]">
                  Minimum Rating
                </h4>
                <div className="flex gap-[8px]">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex-1 px-[12px] py-[8px] rounded-[8px] text-[13px] transition-all ${
                        minRating === rating
                          ? "bg-[#56C490] text-white"
                          : "bg-[#F9FAFB] text-[#111827] hover:bg-[#F3F4F6]"
                      }`}
                    >
                      {rating === 0 ? "Any" : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price */}
              <div className="mb-[24px]">
                <h4 className="text-[#111827] text-[14px] font-semibold mb-[12px]">
                  Maximum Price per Hour
                </h4>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-[#56C490]"
                />
                <div className="flex justify-between mt-[8px]">
                  <span className="text-[#6B7280] text-[13px]">₱100</span>
                  <span className="text-[#56C490] text-[14px] font-semibold">
                    ₱{maxPrice}
                  </span>
                  <span className="text-[#6B7280] text-[13px]">₱1000</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-[24px] py-[16px] border-t border-[#E5E7EB] flex gap-[12px]">
              <button
                onClick={() => {
                  setSelectedService("All");
                  setMinRating(0);
                  setMaxPrice(1000);
                }}
                className="flex-1 bg-white border-2 border-[#E5E7EB] text-[#111827] font-semibold text-[14px] py-[12px] rounded-[10px] transition-all active:scale-95"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 bg-[#56C490] text-white font-semibold text-[14px] py-[12px] rounded-[10px] shadow-[0_2px_8px_rgba(86,196,144,0.25)] transition-all active:scale-95"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
