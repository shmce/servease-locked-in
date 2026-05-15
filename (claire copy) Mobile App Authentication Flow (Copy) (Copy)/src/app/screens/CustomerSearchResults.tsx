import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, Search, Star, X } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

// All searchable services
const allServices = [
  {
    id: 1,
    name: "House Cleaning",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
    price: 45,
    description: "Professional deep cleaning for your home",
    rating: 4.8,
    reviews: 156,
    keywords: ["cleaning", "house", "deep clean", "home cleaning"]
  },
  {
    id: 2,
    name: "Plumbing Repair",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&q=80",
    price: 60,
    description: "Expert plumbing services and repairs",
    rating: 4.9,
    reviews: 203,
    keywords: ["plumbing", "plumber", "leak", "pipe", "water"]
  },
  {
    id: 3,
    name: "Electrical Repair",
    image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80",
    price: 55,
    description: "Licensed electricians for all electrical needs",
    rating: 4.7,
    reviews: 178,
    keywords: ["electrical", "electrician", "wiring", "electric", "power"]
  },
  {
    id: 4,
    name: "Aircon Cleaning",
    image: "https://images.unsplash.com/photo-1631545806609-c2e4b4dbef81?w=400&q=80",
    price: 35,
    description: "Professional aircon servicing and cleaning",
    rating: 4.8,
    reviews: 142,
    keywords: ["aircon", "ac", "air conditioning", "cooling"]
  },
  {
    id: 5,
    name: "Pest Control",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    price: 80,
    description: "Safe and effective pest control solutions",
    rating: 4.6,
    reviews: 98,
    keywords: ["pest", "exterminator", "insects", "rats", "cockroach"]
  },
  {
    id: 6,
    name: "Painting Service",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80",
    price: 70,
    description: "Interior and exterior painting services",
    rating: 4.7,
    reviews: 134,
    keywords: ["painting", "paint", "painter", "wall", "interior", "exterior"]
  },
  {
    id: 7,
    name: "Carpentry",
    image: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=400&q=80",
    price: 65,
    description: "Custom carpentry and woodwork services",
    rating: 4.9,
    reviews: 167,
    keywords: ["carpentry", "carpenter", "wood", "furniture", "cabinet"]
  },
  {
    id: 8,
    name: "Gardening",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80",
    price: 40,
    description: "Lawn care and garden maintenance",
    rating: 4.5,
    reviews: 89,
    keywords: ["gardening", "garden", "lawn", "landscaping", "plants"]
  },
  {
    id: 9,
    name: "Appliance Repair",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80",
    price: 50,
    description: "Repair services for all home appliances",
    rating: 4.8,
    reviews: 145,
    keywords: ["appliance", "repair", "refrigerator", "washing machine", "dryer"]
  },
  {
    id: 10,
    name: "Locksmith",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80",
    price: 75,
    description: "Emergency locksmith services available 24/7",
    rating: 4.9,
    reviews: 211,
    keywords: ["locksmith", "lock", "key", "door", "emergency"]
  },
  {
    id: 11,
    name: "Moving Service",
    image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400&q=80",
    price: 120,
    description: "Professional moving and packing services",
    rating: 4.6,
    reviews: 102,
    keywords: ["moving", "mover", "packing", "relocation", "transport"]
  },
  {
    id: 12,
    name: "Car Wash",
    image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=400&q=80",
    price: 30,
    description: "Mobile car wash and detailing services",
    rating: 4.7,
    reviews: 124,
    keywords: ["car wash", "auto", "vehicle", "detailing", "cleaning"]
  },
  {
    id: 13,
    name: "Massage Therapy",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80",
    price: 85,
    description: "Relaxing massage therapy at your home",
    rating: 4.9,
    reviews: 189,
    keywords: ["massage", "spa", "therapy", "relaxation", "wellness"]
  },
  {
    id: 14,
    name: "Computer Repair",
    image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&q=80",
    price: 60,
    description: "Expert computer and laptop repair services",
    rating: 4.8,
    reviews: 156,
    keywords: ["computer", "laptop", "pc", "tech", "repair"]
  },
  {
    id: 15,
    name: "Laundry Service",
    image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&q=80",
    price: 25,
    description: "Wash, dry, and fold laundry services",
    rating: 4.6,
    reviews: 112,
    keywords: ["laundry", "wash", "dry", "fold", "cleaning"]
  },
  {
    id: 16,
    name: "Tutoring",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80",
    price: 50,
    description: "Private tutoring for all subjects and levels",
    rating: 4.9,
    reviews: 198,
    keywords: ["tutoring", "tutor", "education", "teaching", "lessons"]
  },
  {
    id: 17,
    name: "Pet Grooming",
    image: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&q=80",
    price: 55,
    description: "Professional pet grooming services",
    rating: 4.7,
    reviews: 143,
    keywords: ["pet", "grooming", "dog", "cat", "animal"]
  },
  {
    id: 18,
    name: "Roofing Repair",
    image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&q=80",
    price: 150,
    description: "Roof inspection and repair services",
    rating: 4.8,
    reviews: 87,
    keywords: ["roofing", "roof", "repair", "leak", "inspection"]
  },
  {
    id: 19,
    name: "Window Cleaning",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&q=80",
    price: 40,
    description: "Streak-free window cleaning services",
    rating: 4.7,
    reviews: 134,
    keywords: ["window", "glass", "cleaning"]
  },
  {
    id: 20,
    name: "Tile Installation",
    image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&q=80",
    price: 90,
    description: "Professional tile and flooring installation",
    rating: 4.8,
    reviews: 156,
    keywords: ["tile", "flooring", "installation", "ceramic"]
  }
];

export default function CustomerSearchResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filteredServices, setFilteredServices] = useState<typeof allServices>([]);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    
    if (query === "") {
      setFilteredServices([]);
      return;
    }

    const results = allServices.filter(service => {
      // Search in name
      if (service.name.toLowerCase().includes(query)) return true;
      
      // Search in description
      if (service.description.toLowerCase().includes(query)) return true;
      
      // Search in keywords
      if (service.keywords.some(keyword => keyword.toLowerCase().includes(query))) return true;
      
      return false;
    });

    setFilteredServices(results);
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
    setFilteredServices([]);
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header with Search Bar */}
      <div className="bg-white px-[24px] py-[12px] border-b border-[#F2F2F2] flex-shrink-0">
        <div className="flex items-center gap-[12px]">
          <button
            onClick={() => navigate("/customer/home")}
            className="w-[40px] h-[40px] flex items-center justify-center -ml-[8px] transition-all active:scale-90 flex-shrink-0"
          >
            <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
          </button>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder='Search for "Indoor Cleaning"'
              autoFocus
              className="w-full pl-[48px] pr-[40px] py-[12px] rounded-[12px] bg-[#F9FAFB] border border-[#E5E7EB] font-['Nunito',sans-serif] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[24px] h-[24px] flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-[18px] h-[18px] text-[#9CA3AF]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        {searchQuery === "" ? (
          // Empty state - no search query
          <div className="text-center py-[80px] px-[24px]">
            <div className="w-[80px] h-[80px] bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-[16px]">
              <Search className="w-[40px] h-[40px] text-[#9CA3AF]" />
            </div>
            <p className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[8px]">
              Search for services
            </p>
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[20px]">
              Try searching for house cleaning, plumbing, electrical, or painting
            </p>
            
            {/* Popular searches */}
            <div className="mt-[24px]">
              <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[12px] text-left">
                Popular searches
              </p>
              <div className="flex flex-wrap gap-[8px]">
                {["House Cleaning", "Plumbing", "Electrical", "Painting", "Aircon Cleaning"].map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-[16px] py-[8px] bg-[#F3F4F6] rounded-[20px] font-['Nunito',sans-serif] text-[13px] text-[#374151] transition-all active:scale-95 hover:bg-[#E5E7EB]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          // No results found
          <div className="text-center py-[80px] px-[24px]">
            <div className="w-[80px] h-[80px] bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto mb-[16px]">
              <Search className="w-[40px] h-[40px] text-[#EF4444]" />
            </div>
            <p className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[8px]">
              Service not available
            </p>
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[20px]">
              We couldn't find "{searchQuery}" in our services
            </p>
            <button
              onClick={() => navigate("/customer/all-services")}
              className="font-['Nunito',sans-serif] text-[14px] text-[#56C490] transition-all active:scale-95"
            >
              Browse all services
            </button>
          </div>
        ) : (
          // Results found
          <div className="px-[24px] py-[20px]">
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[16px]">
              Found {filteredServices.length} {filteredServices.length === 1 ? "service" : "services"}
            </p>
            
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
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
