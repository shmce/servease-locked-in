import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, Search, Star } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

// Recommended services based on user preferences and history
const recommendedServices = [
  {
    id: 1,
    name: "Deep House Cleaning",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
    price: 65,
    description: "Thorough cleaning of your entire home including hard-to-reach areas",
    rating: 4.9,
    reviews: 234
  },
  {
    id: 2,
    name: "Plumbing Repair",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&q=80",
    price: 85,
    description: "Expert plumbing repairs for leaks, clogs, and installations",
    rating: 4.8,
    reviews: 189
  },
  {
    id: 3,
    name: "Landscape Design",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80",
    price: 120,
    description: "Professional landscape design and garden makeover services",
    rating: 4.7,
    reviews: 156
  },
  {
    id: 4,
    name: "Home Security Installation",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80",
    price: 200,
    description: "Smart home security system installation and setup",
    rating: 4.9,
    reviews: 201
  },
  {
    id: 5,
    name: "HVAC Maintenance",
    image: "https://images.unsplash.com/photo-1631545806609-c2e4b4dbef81?w=400&q=80",
    price: 110,
    description: "Air conditioning and heating system maintenance and repair",
    rating: 4.8,
    reviews: 167
  },
  {
    id: 6,
    name: "Roof Inspection",
    image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&q=80",
    price: 95,
    description: "Professional roof inspection and damage assessment",
    rating: 4.6,
    reviews: 142
  },
  {
    id: 7,
    name: "Interior Painting",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80",
    price: 150,
    description: "Professional interior painting with premium quality finishes",
    rating: 4.9,
    reviews: 198
  },
  {
    id: 8,
    name: "Window Cleaning",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&q=80",
    price: 55,
    description: "Streak-free window cleaning for homes and offices",
    rating: 4.7,
    reviews: 134
  },
  {
    id: 9,
    name: "Furniture Assembly",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&q=80",
    price: 60,
    description: "Expert furniture assembly and installation services",
    rating: 4.8,
    reviews: 178
  },
  {
    id: 10,
    name: "Pressure Washing",
    image: "https://images.unsplash.com/photo-1584622781867-8e8bd4a4dbbd?w=400&q=80",
    price: 80,
    description: "High-pressure cleaning for driveways, patios, and exterior surfaces",
    rating: 4.9,
    reviews: 211
  },
  {
    id: 11,
    name: "Pool Maintenance",
    image: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=400&q=80",
    price: 90,
    description: "Complete pool cleaning, chemical balancing, and equipment maintenance",
    rating: 4.7,
    reviews: 123
  },
  {
    id: 12,
    name: "Gutter Cleaning",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80",
    price: 70,
    description: "Professional gutter cleaning and debris removal services",
    rating: 4.6,
    reviews: 98
  },
  {
    id: 13,
    name: "Smart Home Setup",
    image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&q=80",
    price: 175,
    description: "Installation and configuration of smart home devices and automation",
    rating: 4.9,
    reviews: 187
  },
  {
    id: 14,
    name: "Tile & Grout Cleaning",
    image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&q=80",
    price: 85,
    description: "Deep cleaning and restoration of tile floors and grout lines",
    rating: 4.8,
    reviews: 156
  },
  {
    id: 15,
    name: "Kitchen Renovation",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80",
    price: 500,
    description: "Complete kitchen remodeling and renovation services",
    rating: 4.9,
    reviews: 89
  }
];

export default function CustomerRecommendedServices() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter services based on search query
  const filteredServices = recommendedServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
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
          Recommended for You
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
            placeholder="Search recommended services..."
            className="w-full pl-[48px] pr-[16px] py-[12px] rounded-[12px] bg-[#F9FAFB] border border-[#E5E7EB] font-['Nunito',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20 transition-all"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        <div className="px-[24px] py-[20px]">
          {filteredServices.length === 0 ? (
            <div className="text-center py-[60px]">
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#9CA3AF] mb-[8px]">
                No services found
              </p>
              <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                Try searching with different keywords
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-[16px]">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => navigate(`/customer/service/${service.id}`)}
                  className="bg-white rounded-[12px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all active:scale-95"
                >
                  {/* Service Image */}
                  <div className="w-full h-[140px] overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Service Info */}
                  <div className="p-[12px]">
                    <h3 className="font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[4px] text-left line-clamp-1">
                      {service.name}
                    </h3>
                    
                    <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280] mb-[8px] text-left line-clamp-2 leading-[1.4]">
                      {service.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-[4px] mb-[8px]">
                      <Star className="w-[12px] h-[12px] text-[#FFC107] fill-[#FFC107]" />
                      <span className="font-['Nunito',sans-serif] text-[12px] text-[#111827]">
                        {service.rating}
                      </span>
                      <span className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF]">
                        ({service.reviews})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]">
                        From ${service.price}
                      </span>
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
