import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Star, MapPin, MessageCircle, Calendar, Clock, CheckCircle, Award, FileText, Briefcase, Languages, ChevronRight, X } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

// Mock provider data
const providerData = {
  id: "1",
  name: "Carlos Mendoza",
  verified: true,
  licensed: true,
  insured: true,
  rating: 4.9,
  totalReviews: 267,
  totalBookings: 1245,
  yearsOfExperience: 8,
  bio: "Professional electrician with over 8 years of experience in residential and commercial electrical work. Certified master electrician specializing in installations, repairs, and maintenance. Committed to delivering high-quality service with attention to safety and customer satisfaction.",
  categories: ["Electrical Services", "Home Repairs", "Installation"],
  serviceAreas: ["Manila", "Quezon City", "Makati", "Pasig", "Taguig"],
  languages: ["English", "Tagalog", "Cebuano"],
  licenses: [
    { type: "Master Electrician License", number: "PRC-ME-20150234" },
    { type: "Electrical Contractor License", number: "PEEC-2016-0892" }
  ],
  certifications: [
    "Advanced Electrical Systems Training",
    "Solar Panel Installation Certified",
    "Industrial Wiring Specialist"
  ],
  businessPermit: "Manila-2024-BP-45678",
  services: [
    {
      id: 1,
      name: "Electrical Installation",
      description: "Complete electrical wiring for new constructions and renovations",
      duration: "4-8 hours",
      price: "₱2,500"
    },
    {
      id: 2,
      name: "Circuit Breaker Repair",
      description: "Diagnosis and repair of electrical panel and circuit breakers",
      duration: "2-3 hours",
      price: "₱1,200"
    },
    {
      id: 3,
      name: "Lighting Installation",
      description: "Installation of ceiling lights, chandeliers, and outdoor lighting",
      duration: "1-2 hours",
      price: "₱800"
    },
    {
      id: 4,
      name: "Electrical Troubleshooting",
      description: "Identify and fix electrical issues in residential properties",
      duration: "1-3 hours",
      price: "₱1,000"
    }
  ],
  portfolio: [
    {
      id: 1,
      beforeImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400",
      afterImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      caption: "Complete home rewiring and modern lighting installation",
      date: "February 2024"
    },
    {
      id: 2,
      beforeImage: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
      afterImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      caption: "Commercial electrical panel upgrade",
      date: "January 2024"
    },
    {
      id: 3,
      beforeImage: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
      afterImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400",
      caption: "Outdoor lighting system installation",
      date: "December 2023"
    },
    {
      id: 4,
      beforeImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      afterImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400",
      caption: "Emergency electrical repair and restoration",
      date: "November 2023"
    }
  ],
  reviews: [
    {
      id: 1,
      customerName: "M***a R.",
      rating: 5,
      date: "March 10, 2024",
      text: "Carlos did an excellent job installing our new lighting fixtures. Very professional and cleaned up after the work. Highly recommended!",
      serviceType: "Lighting Installation",
      photos: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
      providerResponse: "Thank you for the kind words! It was a pleasure working with you.",
      helpfulCount: 12
    },
    {
      id: 2,
      customerName: "J***n T.",
      rating: 5,
      date: "March 5, 2024",
      text: "Fast response and fixed our electrical issue quickly. Very knowledgeable and explained everything clearly.",
      serviceType: "Electrical Troubleshooting",
      photos: [],
      providerResponse: "Glad I could help! Don't hesitate to reach out if you need anything else.",
      helpfulCount: 8
    },
    {
      id: 3,
      customerName: "L***a S.",
      rating: 4,
      date: "February 28, 2024",
      text: "Good service overall. Arrived on time and completed the work as promised. Would use again.",
      serviceType: "Circuit Breaker Repair",
      photos: [],
      providerResponse: "",
      helpfulCount: 5
    },
    {
      id: 4,
      customerName: "R***o P.",
      rating: 5,
      date: "February 20, 2024",
      text: "Carlos is the best! He rewired our entire house and the quality of work is outstanding. Very fair pricing too.",
      serviceType: "Electrical Installation",
      photos: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400", "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400"],
      providerResponse: "Thank you so much! It was a big project and I'm happy you're satisfied with the results.",
      helpfulCount: 15
    },
    {
      id: 5,
      customerName: "A***a M.",
      rating: 5,
      date: "February 15, 2024",
      text: "Professional and efficient. Fixed our power outage problem in no time. Will definitely call again.",
      serviceType: "Electrical Troubleshooting",
      photos: [],
      providerResponse: "",
      helpfulCount: 6
    }
  ]
};

type TabType = "About" | "Services" | "Portfolio" | "Reviews" | "Availability";

export default function ProviderProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("About");
  const [selectedPortfolioImage, setSelectedPortfolioImage] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<"All" | "Recent" | "High Rating" | "Low Rating">("All");
  const [visibleReviews, setVisibleReviews] = useState(3);

  const handleBookNow = () => {
    navigate(`/customer/booking-form/${id}`);
  };

  const handleMessage = () => {
    navigate(`/customer/messages`);
  };

  const filteredReviews = providerData.reviews.filter(review => {
    if (reviewFilter === "All") return true;
    if (reviewFilter === "Recent") return true; // Already sorted by date
    if (reviewFilter === "High Rating") return review.rating >= 4;
    if (reviewFilter === "Low Rating") return review.rating <= 3;
    return true;
  });

  const ratingBreakdown = {
    5: Math.floor((providerData.reviews.filter(r => r.rating === 5).length / providerData.reviews.length) * 100),
    4: Math.floor((providerData.reviews.filter(r => r.rating === 4).length / providerData.reviews.length) * 100),
    3: Math.floor((providerData.reviews.filter(r => r.rating === 3).length / providerData.reviews.length) * 100),
    2: Math.floor((providerData.reviews.filter(r => r.rating === 2).length / providerData.reviews.length) * 100),
    1: Math.floor((providerData.reviews.filter(r => r.rating === 1).length / providerData.reviews.length) * 100),
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Top Navigation Bar */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0 border-b border-[#e5e5e5]">
        <button
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#111827]" />
        </button>
        <h2 className="font-semibold text-[18px] text-[#111827]">
          Provider Profile
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[16px]">
        {/* Cover Photo */}
        <div className="w-full h-[160px] bg-gradient-to-r from-[#56C490] to-[#00a055] relative">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800" 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Profile Photo - Overlapping */}
        <div className="px-[24px] -mt-[50px] mb-[16px] relative z-10">
          <div className="w-[100px] h-[100px] rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" 
              alt={providerData.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Provider Name & Badges */}
        <div className="px-[24px] mb-[16px]">
          <h1 className="font-bold text-[28px] text-[#111827] leading-[1.2] mb-[8px]">
            {providerData.name}
          </h1>
          <div className="flex items-center gap-[8px] flex-wrap">
            {providerData.verified && (
              <div className="flex items-center gap-[4px] px-[10px] py-[4px] bg-[#56C490] rounded-full">
                <CheckCircle className="w-[14px] h-[14px] text-white" />
                <span className="text-[12px] font-medium text-white">Verified</span>
              </div>
            )}
            {providerData.licensed && (
              <div className="flex items-center gap-[4px] px-[10px] py-[4px] bg-[#3b82f6] rounded-full">
                <Award className="w-[14px] h-[14px] text-white" />
                <span className="text-[12px] font-medium text-white">Licensed</span>
              </div>
            )}
            {providerData.insured && (
              <div className="flex items-center gap-[4px] px-[10px] py-[4px] bg-[#8b5cf6] rounded-full">
                <FileText className="w-[14px] h-[14px] text-white" />
                <span className="text-[12px] font-medium text-white">Insured</span>
              </div>
            )}
          </div>
        </div>

        {/* Provider Stats Cards */}
        <div className="px-[24px] mb-[20px]">
          <div className="grid grid-cols-2 gap-[12px]">
            <div className="bg-[#f9fafb] rounded-[16px] p-[16px]">
              <div className="flex items-center gap-[4px] mb-[4px]">
                <Star className="w-[20px] h-[20px] text-[#f59e0b] fill-[#f59e0b]" />
                <span className="font-bold text-[24px] text-[#111827]">{providerData.rating}</span>
              </div>
              <p className="text-[14px] font-normal text-[#6b7280]">Overall Rating</p>
            </div>
            <div className="bg-[#f9fafb] rounded-[16px] p-[16px]">
              <p className="font-bold text-[24px] text-[#111827] mb-[4px]">{providerData.totalReviews}</p>
              <p className="text-[14px] font-normal text-[#6b7280]">Total Reviews</p>
            </div>
            <div className="bg-[#f9fafb] rounded-[16px] p-[16px]">
              <p className="font-bold text-[24px] text-[#111827] mb-[4px]">{providerData.totalBookings}</p>
              <p className="text-[14px] font-normal text-[#6b7280]">Total Bookings</p>
            </div>
            <div className="bg-[#f9fafb] rounded-[16px] p-[16px]">
              <p className="font-bold text-[24px] text-[#111827] mb-[4px]">{providerData.yearsOfExperience}+</p>
              <p className="text-[14px] font-normal text-[#6b7280]">Years Experience</p>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="px-[24px] mb-[24px]">
          <div className="grid grid-cols-2 gap-[12px]">
            <button
              onClick={handleMessage}
              className="flex items-center justify-center gap-[8px] px-[16px] py-[14px] bg-white border-2 border-[#56C490] rounded-[12px] transition-all active:scale-95"
            >
              <MessageCircle className="w-[20px] h-[20px] text-[#56C490]" />
              <span className="font-semibold text-[16px] text-[#56C490]">Message</span>
            </button>
            <button
              onClick={handleBookNow}
              className="flex items-center justify-center gap-[8px] px-[16px] py-[14px] bg-[#56C490] rounded-[12px] transition-all active:scale-95"
            >
              <Calendar className="w-[20px] h-[20px] text-white" />
              <span className="font-semibold text-[16px] text-white">Book Now</span>
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-[#e5e7eb] mb-[20px]">
          <div className="flex overflow-x-auto no-scrollbar px-[24px]">
            {(["About", "Services", "Portfolio", "Reviews", "Availability"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-[16px] py-[12px] border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-[#56C490] text-[#56C490]"
                    : "border-transparent text-[#6b7280]"
                }`}
              >
                <span className={`text-[14px] ${activeTab === tab ? "font-semibold" : "font-normal"}`}>
                  {tab}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-[24px]">
          {/* About Tab */}
          {activeTab === "About" && (
            <div className="space-y-[20px]">
              {/* Bio */}
              <div className="bg-[#f9fafb] rounded-[16px] p-[16px]">
                <h3 className="font-semibold text-[16px] text-[#111827] mb-[8px]">About</h3>
                <p className="text-[14px] font-normal text-[#374151] leading-[1.6]">
                  {providerData.bio}
                </p>
              </div>

              {/* Service Categories */}
              <div className="bg-[#f9fafb] rounded-[16px] p-[16px]">
                <h3 className="font-semibold text-[16px] text-[#111827] mb-[12px]">Service Categories</h3>
                <div className="flex flex-wrap gap-[8px]">
                  {providerData.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-[12px] py-[6px] bg-white border border-[#e5e7eb] rounded-[8px] text-[14px] font-normal text-[#374151]"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Service Areas */}
              <div className="bg-[#f9fafb] rounded-[16px] p-[16px]">
                <div className="flex items-center gap-[8px] mb-[12px]">
                  <MapPin className="w-[18px] h-[18px] text-[#56C490]" />
                  <h3 className="font-semibold text-[16px] text-[#111827]">Service Areas</h3>
                </div>
                <div className="flex flex-wrap gap-[8px]">
                  {providerData.serviceAreas.map((area, index) => (
                    <span
                      key={index}
                      className="px-[12px] py-[6px] bg-white border border-[#e5e7eb] rounded-[8px] text-[14px] font-normal text-[#374151]"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="bg-[#f9fafb] rounded-[16px] p-[16px]">
                <div className="flex items-center gap-[8px] mb-[12px]">
                  <Languages className="w-[18px] h-[18px] text-[#56C490]" />
                  <h3 className="font-semibold text-[16px] text-[#111827]">Languages</h3>
                </div>
                <div className="flex flex-wrap gap-[8px]">
                  {providerData.languages.map((language, index) => (
                    <span
                      key={index}
                      className="px-[12px] py-[6px] bg-white border border-[#e5e7eb] rounded-[8px] text-[14px] font-normal text-[#374151]"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>

              {/* Professional Licenses */}
              <div className="bg-[#f9fafb] rounded-[16px] p-[16px]">
                <div className="flex items-center gap-[8px] mb-[12px]">
                  <Award className="w-[18px] h-[18px] text-[#56C490]" />
                  <h3 className="font-semibold text-[16px] text-[#111827]">Professional Licenses</h3>
                </div>
                <div className="space-y-[12px]">
                  {providerData.licenses.map((license, index) => (
                    <div key={index} className="bg-white rounded-[8px] p-[12px]">
                      <p className="text-[14px] font-medium text-[#374151] mb-[4px]">{license.type}</p>
                      <p className="text-[12px] font-normal text-[#9ca3af]">License #: {license.number}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-[#f9fafb] rounded-[16px] p-[16px]">
                <div className="flex items-center gap-[8px] mb-[12px]">
                  <Briefcase className="w-[18px] h-[18px] text-[#56C490]" />
                  <h3 className="font-semibold text-[16px] text-[#111827]">Certifications</h3>
                </div>
                <div className="space-y-[8px]">
                  {providerData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-[8px]">
                      <CheckCircle className="w-[16px] h-[16px] text-[#56C490] flex-shrink-0" />
                      <p className="text-[14px] font-normal text-[#374151]">{cert}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Permit */}
              <div className="bg-[#f9fafb] rounded-[16px] p-[16px]">
                <div className="flex items-center gap-[8px] mb-[8px]">
                  <FileText className="w-[18px] h-[18px] text-[#56C490]" />
                  <h3 className="font-semibold text-[16px] text-[#111827]">Business Permit</h3>
                </div>
                <p className="text-[14px] font-normal text-[#374151]">Permit #: {providerData.businessPermit}</p>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === "Services" && (
            <div className="space-y-[16px]">
              {providerData.services.map((service) => (
                <div key={service.id} className="bg-[#f9fafb] rounded-[16px] p-[16px]">
                  <h3 className="font-semibold text-[18px] text-[#111827] mb-[8px]">{service.name}</h3>
                  <p className="text-[14px] font-normal text-[#6b7280] mb-[12px] leading-[1.6]">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-[16px] mb-[16px]">
                    <div className="flex items-center gap-[6px]">
                      <Clock className="w-[16px] h-[16px] text-[#6b7280]" />
                      <span className="text-[14px] font-normal text-[#6b7280]">{service.duration}</span>
                    </div>
                    <div className="h-[4px] w-[4px] rounded-full bg-[#d1d5db]" />
                    <span className="font-semibold text-[18px] text-[#56C490]">{service.price}</span>
                  </div>
                  <button
                    onClick={handleBookNow}
                    className="w-full px-[16px] py-[12px] bg-[#56C490] rounded-[12px] transition-all active:scale-95"
                  >
                    <span className="font-semibold text-[16px] text-white">Add to Booking</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === "Portfolio" && (
            <div>
              <div className="grid grid-cols-2 gap-[12px]">
                {providerData.portfolio.map((item) => (
                  <div key={item.id}>
                    {/* Before/After Images */}
                    <div className="mb-[8px] space-y-[8px]">
                      <div 
                        className="relative bg-[#f5f5f5] rounded-[12px] overflow-hidden aspect-square cursor-pointer"
                        onClick={() => setSelectedPortfolioImage(item.beforeImage)}
                      >
                        <img 
                          src={item.beforeImage} 
                          alt="Before" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-[8px] left-[8px] px-[8px] py-[4px] bg-black/60 rounded-[6px]">
                          <span className="text-[10px] font-medium text-white">BEFORE</span>
                        </div>
                      </div>
                      <div 
                        className="relative bg-[#f5f5f5] rounded-[12px] overflow-hidden aspect-square cursor-pointer"
                        onClick={() => setSelectedPortfolioImage(item.afterImage)}
                      >
                        <img 
                          src={item.afterImage} 
                          alt="After" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-[8px] left-[8px] px-[8px] py-[4px] bg-[#56C490] rounded-[6px]">
                          <span className="text-[10px] font-medium text-white">AFTER</span>
                        </div>
                      </div>
                    </div>
                    {/* Caption and Date */}
                    <div className="mb-[12px]">
                      <p className="text-[12px] font-normal text-[#374151] leading-[1.4] mb-[4px]">
                        {item.caption}
                      </p>
                      <p className="text-[11px] font-normal text-[#9ca3af]">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "Reviews" && (
            <div>
              {/* Rating Summary */}
              <div className="bg-[#f9fafb] rounded-[16px] p-[16px] mb-[20px]">
                <div className="flex items-center gap-[16px] mb-[16px]">
                  <div className="text-center">
                    <p className="font-bold text-[48px] text-[#111827] leading-[1]">{providerData.rating}</p>
                    <div className="flex items-center gap-[4px] justify-center mt-[4px]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-[16px] h-[16px] ${
                            star <= Math.floor(providerData.rating)
                              ? "text-[#f59e0b] fill-[#f59e0b]"
                              : "text-[#e5e7eb] fill-[#e5e7eb]"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[12px] font-normal text-[#6b7280] mt-[4px]">
                      {providerData.totalReviews} reviews
                    </p>
                  </div>
                  <div className="flex-1 space-y-[6px]">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-[8px]">
                        <span className="text-[12px] font-normal text-[#6b7280] w-[8px]">{rating}</span>
                        <Star className="w-[12px] h-[12px] text-[#f59e0b] fill-[#f59e0b]" />
                        <div className="flex-1 h-[6px] bg-[#e5e7eb] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#f59e0b] rounded-full"
                            style={{ width: `${ratingBreakdown[rating as keyof typeof ratingBreakdown]}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-normal text-[#6b7280] w-[32px] text-right">
                          {ratingBreakdown[rating as keyof typeof ratingBreakdown]}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Filters */}
              <div className="flex gap-[8px] overflow-x-auto no-scrollbar mb-[20px]">
                {(["All", "Recent", "High Rating", "Low Rating"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setReviewFilter(filter)}
                    className={`flex-shrink-0 px-[16px] py-[8px] rounded-[20px] transition-colors ${
                      reviewFilter === filter
                        ? "bg-[#56C490] text-white"
                        : "bg-[#f3f4f6] text-[#6b7280]"
                    }`}
                  >
                    <span className="text-[14px] font-medium">{filter}</span>
                  </button>
                ))}
              </div>

              {/* Review Cards */}
              <div className="space-y-[16px] mb-[20px]">
                {filteredReviews.slice(0, visibleReviews).map((review) => (
                  <div key={review.id} className="bg-[#f9fafb] rounded-[16px] p-[16px]">
                    <div className="flex items-start justify-between mb-[12px]">
                      <div className="flex-1">
                        <p className="font-medium text-[14px] text-[#111827] mb-[4px]">
                          {review.customerName}
                        </p>
                        <div className="flex items-center gap-[8px] mb-[4px]">
                          <div className="flex items-center gap-[2px]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-[14px] h-[14px] ${
                                  star <= review.rating
                                    ? "text-[#f59e0b] fill-[#f59e0b]"
                                    : "text-[#e5e7eb] fill-[#e5e7eb]"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[12px] font-normal text-[#9ca3af]">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[14px] font-normal text-[#374151] leading-[1.6] mb-[12px]">
                      {review.text}
                    </p>
                    <div className="flex items-center gap-[8px] mb-[12px]">
                      <div className="px-[8px] py-[4px] bg-white rounded-[6px]">
                        <span className="text-[12px] font-normal text-[#6b7280]">{review.serviceType}</span>
                      </div>
                    </div>
                    {review.photos.length > 0 && (
                      <div className="flex gap-[8px] mb-[12px] overflow-x-auto no-scrollbar">
                        {review.photos.map((photo, index) => (
                          <div
                            key={index}
                            className="w-[80px] h-[80px] bg-[#f5f5f5] rounded-[8px] overflow-hidden flex-shrink-0 cursor-pointer"
                            onClick={() => setSelectedPortfolioImage(photo)}
                          >
                            <img src={photo} alt="Review" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    {review.providerResponse && (
                      <div className="bg-white rounded-[12px] p-[12px] border-l-4 border-[#56C490]">
                        <p className="font-medium text-[12px] text-[#111827] mb-[4px]">Provider Response</p>
                        <p className="text-[12px] font-normal text-[#6b7280] leading-[1.5]">
                          {review.providerResponse}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-[4px] mt-[12px] pt-[12px] border-t border-[#e5e7eb]">
                      <span className="text-[12px] font-normal text-[#9ca3af]">
                        {review.helpfulCount} people found this helpful
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {visibleReviews < filteredReviews.length && (
                <button
                  onClick={() => setVisibleReviews(prev => prev + 3)}
                  className="w-full px-[16px] py-[12px] bg-white border-2 border-[#56C490] rounded-[12px] transition-all active:scale-95"
                >
                  <span className="font-semibold text-[16px] text-[#56C490]">Load More Reviews</span>
                </button>
              )}
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === "Availability" && (
            <div>
              {/* Next Available Slot */}
              <div className="bg-[#56C490] rounded-[16px] p-[16px] mb-[20px]">
                <p className="text-[14px] font-medium text-white/80 mb-[4px]">Next Available Slot</p>
                <p className="font-semibold text-[20px] text-white">March 15, 2024 at 9:00 AM</p>
              </div>

              {/* Calendar Legend */}
              <div className="flex items-center gap-[16px] mb-[20px] flex-wrap">
                <div className="flex items-center gap-[6px]">
                  <div className="w-[12px] h-[12px] bg-[#56C490] rounded-[3px]" />
                  <span className="text-[12px] font-normal text-[#6b7280]">Available</span>
                </div>
                <div className="flex items-center gap-[6px]">
                  <div className="w-[12px] h-[12px] bg-[#ef4444] rounded-[3px]" />
                  <span className="text-[12px] font-normal text-[#6b7280]">Booked</span>
                </div>
                <div className="flex items-center gap-[6px]">
                  <div className="w-[12px] h-[12px] bg-[#535353] rounded-[3px]" />
                  <span className="text-[12px] font-normal text-[#6b7280]">Blocked</span>
                </div>
              </div>

              {/* Calendar */}
              <div className="bg-[#f9fafb] rounded-[16px] p-[16px]">
                <div className="flex items-center justify-between mb-[16px]">
                  <h3 className="font-semibold text-[18px] text-[#111827]">March 2024</h3>
                  <div className="flex items-center gap-[8px]">
                    <button className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] bg-white transition-all active:scale-90">
                      <ChevronRight className="w-[18px] h-[18px] text-[#6b7280] rotate-180" />
                    </button>
                    <button className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] bg-white transition-all active:scale-90">
                      <ChevronRight className="w-[18px] h-[18px] text-[#6b7280]" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-[8px]">
                  {/* Day Headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center">
                      <span className="text-[12px] font-medium text-[#6b7280]">{day}</span>
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 2; // Start from -2 to show previous month days
                    const isCurrentMonth = day >= 1 && day <= 31;
                    const isBooked = [5, 8, 12, 19, 26].includes(day);
                    const isBlocked = [7, 14, 21, 28].includes(day);
                    const isAvailable = isCurrentMonth && !isBooked && !isBlocked;
                    
                    return (
                      <div
                        key={i}
                        className={`aspect-square flex items-center justify-center rounded-[8px] text-[14px] ${
                          !isCurrentMonth
                            ? "text-[#d1d5db]"
                            : isBooked
                            ? "bg-[#ef4444] text-white font-medium"
                            : isBlocked
                            ? "bg-[#535353] text-white font-medium"
                            : isAvailable
                            ? "bg-[#56C490] text-white font-medium cursor-pointer hover:opacity-80"
                            : "text-[#111827]"
                        }`}
                      >
                        {isCurrentMonth ? day : ""}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-[16px] bg-white border border-[#e5e7eb] rounded-[12px] p-[12px]">
                <p className="text-[12px] font-normal text-[#6b7280] leading-[1.5]">
                  <strong className="text-[#111827]">Note:</strong> Availability is subject to change. 
                  Please confirm your preferred date and time during the booking process.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Viewer Modal */}
      {selectedPortfolioImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setSelectedPortfolioImage(null)}
        >
          <button
            className="absolute top-[60px] right-[24px] w-[40px] h-[40px] flex items-center justify-center rounded-full bg-white/10 transition-all active:scale-90"
            onClick={() => setSelectedPortfolioImage(null)}
          >
            <X className="w-[24px] h-[24px] text-white" />
          </button>
          <img
            src={selectedPortfolioImage}
            alt="Portfolio"
            className="max-w-[90%] max-h-[90%] object-contain"
          />
        </div>
      )}
    </div>
  );
}
