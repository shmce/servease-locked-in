import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, Star, ThumbsUp, Image } from "lucide-react";

type FilterType = "All" | "Recent" | "High Rating" | "Low Rating";

export default function ProviderReviews() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [visibleReviews, setVisibleReviews] = useState(6);

  // Review Summary Data
  const reviewStats = {
    averageRating: 4.7,
    totalReviews: 248,
    breakdown: [
      { stars: 5, count: 180, percentage: 72.6 },
      { stars: 4, count: 45, percentage: 18.1 },
      { stars: 3, count: 15, percentage: 6.0 },
      { stars: 2, count: 5, percentage: 2.0 },
      { stars: 1, count: 3, percentage: 1.2 },
    ],
  };

  // Sample Reviews Data
  const allReviews = [
    {
      id: 1,
      customerName: "Maria S.",
      rating: 5,
      date: "March 10, 2026",
      serviceType: "Home Cleaning",
      reviewText: "Excellent service! Very professional and thorough. My home has never been this clean. Highly recommend!",
      photos: ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400"],
      providerResponse: "Thank you so much for your kind words! We're happy to serve you again anytime.",
      helpfulCount: 12,
    },
    {
      id: 2,
      customerName: "Juan D.",
      rating: 5,
      date: "March 8, 2026",
      serviceType: "Plumbing Repair",
      reviewText: "Fixed my leaking pipes quickly and efficiently. Great work!",
      photos: [],
      providerResponse: null,
      helpfulCount: 8,
    },
    {
      id: 3,
      customerName: "Anna R.",
      rating: 4,
      date: "March 5, 2026",
      serviceType: "Appliance Repair",
      reviewText: "Good service overall. Arrived on time and fixed my refrigerator. Would have given 5 stars if the price was a bit lower.",
      photos: [],
      providerResponse: "Thanks for the feedback! We always strive to offer competitive pricing while maintaining quality service.",
      helpfulCount: 5,
    },
    {
      id: 4,
      customerName: "Pedro M.",
      rating: 5,
      date: "March 3, 2026",
      serviceType: "Electrical Work",
      reviewText: "Very knowledgeable and professional. Solved the electrical issue in my house safely and quickly.",
      photos: ["https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400", "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400"],
      providerResponse: "Safety is our top priority! Glad we could help.",
      helpfulCount: 15,
    },
    {
      id: 5,
      customerName: "Liza G.",
      rating: 3,
      date: "February 28, 2026",
      serviceType: "Home Cleaning",
      reviewText: "Service was okay. Did the job but expected a more detailed cleaning for the price.",
      photos: [],
      providerResponse: "We appreciate your honest feedback and will work on improving our attention to detail.",
      helpfulCount: 3,
    },
    {
      id: 6,
      customerName: "Carlos T.",
      rating: 5,
      date: "February 25, 2026",
      serviceType: "Carpentry",
      reviewText: "Outstanding craftsmanship! Built custom shelves exactly as I wanted. Will definitely hire again.",
      photos: ["https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400"],
      providerResponse: "Thank you! It was a pleasure working on your project.",
      helpfulCount: 20,
    },
    {
      id: 7,
      customerName: "Rosa P.",
      rating: 4,
      date: "February 20, 2026",
      serviceType: "Garden Maintenance",
      reviewText: "Great job trimming the hedges and lawn. Very satisfied with the results.",
      photos: [],
      providerResponse: null,
      helpfulCount: 6,
    },
    {
      id: 8,
      customerName: "Ben L.",
      rating: 5,
      date: "February 18, 2026",
      serviceType: "Painting",
      reviewText: "Professional painter with great attention to detail. My walls look amazing!",
      photos: ["https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400"],
      providerResponse: "Thanks Ben! Happy to bring your vision to life.",
      helpfulCount: 11,
    },
    {
      id: 9,
      customerName: "Grace H.",
      rating: 2,
      date: "February 15, 2026",
      serviceType: "Appliance Repair",
      reviewText: "Service was delayed and communication could be better. The repair was done but not impressed with the overall experience.",
      photos: [],
      providerResponse: "We sincerely apologize for the delay. We've taken steps to improve our scheduling and communication.",
      helpfulCount: 2,
    },
  ];

  // Filter reviews based on active filter
  const getFilteredReviews = () => {
    let filtered = [...allReviews];
    
    switch (activeFilter) {
      case "Recent":
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "High Rating":
        filtered = filtered.filter(r => r.rating >= 4);
        break;
      case "Low Rating":
        filtered = filtered.filter(r => r.rating <= 3);
        break;
      default:
        break;
    }
    
    return filtered.slice(0, visibleReviews);
  };

  const filteredReviews = getFilteredReviews();

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-[2px]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-[14px] h-[14px] ${
              star <= rating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#E5E7EB]"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderLargeStars = (rating: number) => {
    return (
      <div className="flex gap-[4px]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-[32px] h-[32px] ${
              star <= rating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#E5E7EB]"
            }`}
          />
        ))}
      </div>
    );
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
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Customer Reviews
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        className="flex-1 overflow-y-auto px-[24px] pb-[80px]"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style>
          {`
            .flex-1::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>

        {/* Review Summary Section */}
        <div className="pt-[20px] mb-[24px]">
          <div className="bg-gradient-to-br from-[#56C490] to-[#00a055] rounded-[20px] p-[24px] shadow-[0_8px_24px_rgba(86,196,144,0.2)]">
            <div className="text-center mb-[20px]">
              <p className="font-['Nunito',sans-serif] text-[48px] text-white leading-none mb-[4px]">
                {reviewStats.averageRating}
              </p>
              {renderLargeStars(Math.round(reviewStats.averageRating))}
              <p className="font-['Nunito',sans-serif] text-[14px] text-white/90 mt-[8px]">
                Based on {reviewStats.totalReviews} reviews
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-[8px] bg-white/10 rounded-[12px] p-[16px]">
              {reviewStats.breakdown.map((item) => (
                <div key={item.stars} className="flex items-center gap-[12px]">
                  <div className="flex items-center gap-[4px] w-[60px]">
                    <span className="font-['Nunito',sans-serif] text-[13px] text-white">
                      {item.stars}
                    </span>
                    <Star className="w-[12px] h-[12px] fill-white text-white" />
                  </div>
                  <div className="flex-1 h-[8px] bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="font-['Nunito',sans-serif] text-[12px] text-white w-[50px] text-right">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Review Filters */}
        <div className="mb-[20px]">
          <div className="flex gap-[8px] overflow-x-auto pb-[4px]" style={{ scrollbarWidth: 'none' }}>
            {(["All", "Recent", "High Rating", "Low Rating"] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-[16px] py-[8px] rounded-[20px] font-['Nunito',sans-serif] text-[13px] whitespace-nowrap transition-all active:scale-95 ${
                  activeFilter === filter
                    ? "bg-[#56C490] text-white shadow-[0_2px_8px_rgba(86,196,144,0.3)]"
                    : "bg-[#f5f5f5] text-[#6B7280] border border-[#e5e5e5]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Review Cards */}
        <div className="space-y-[16px] mb-[24px]">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border-2 border-[#f2f2f2] rounded-[16px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all active:scale-[0.98]"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-[12px]">
                <div className="flex items-center gap-[12px]">
                  {/* Customer Avatar */}
                  <div className="w-[44px] h-[44px] rounded-full bg-[#56C490] flex items-center justify-center flex-shrink-0">
                    <span className="font-['Nunito',sans-serif] text-[16px] text-white">
                      {review.customerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                      {review.customerName}
                    </p>
                    <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
                      {review.date}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              {/* Service Type Badge */}
              <div className="mb-[12px]">
                <span className="inline-block px-[10px] py-[4px] bg-[#56C490]/10 rounded-[6px] font-['Nunito',sans-serif] text-[11px] text-[#56C490]">
                  {review.serviceType}
                </span>
              </div>

              {/* Review Text */}
              <p className="font-['Nunito',sans-serif] text-[14px] text-[#374151] leading-relaxed mb-[12px]">
                {review.reviewText}
              </p>

              {/* Photo Attachments */}
              {review.photos.length > 0 && (
                <div className="flex gap-[8px] mb-[12px] overflow-x-auto pb-[4px]" style={{ scrollbarWidth: 'none' }}>
                  {review.photos.map((photo, index) => (
                    <div key={index} className="relative w-[80px] h-[80px] flex-shrink-0 rounded-[8px] overflow-hidden border border-[#e5e5e5]">
                      <img
                        src={photo}
                        alt={`Review photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-[4px] right-[4px] w-[20px] h-[20px] bg-black/50 rounded-full flex items-center justify-center">
                        <Image className="w-[12px] h-[12px] text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Provider Response */}
              {review.providerResponse && (
                <div className="bg-[#f9fafb] border border-[#e5e5e5] rounded-[10px] p-[12px] mb-[12px]">
                  <p className="font-['Nunito',sans-serif] text-[12px] text-[#56C490] mb-[6px]">
                    Your Response:
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-relaxed">
                    {review.providerResponse}
                  </p>
                </div>
              )}

              {/* Helpful Button */}
              <div className="flex items-center justify-between pt-[12px] border-t border-[#f2f2f2]">
                <button className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] bg-[#f5f5f5] border border-[#e5e5e5] transition-all active:scale-95">
                  <ThumbsUp className="w-[14px] h-[14px] text-[#6B7280]" />
                  <span className="font-['Nunito',sans-serif] text-[12px] text-[#6B7280]">
                    Helpful ({review.helpfulCount})
                  </span>
                </button>
                
                {!review.providerResponse && (
                  <button className="px-[12px] py-[6px] rounded-[8px] bg-[#56C490] transition-all active:scale-95">
                    <span className="font-['Nunito',sans-serif] text-[12px] text-white">
                      Respond
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleReviews < allReviews.length && (
          <button
            onClick={() => setVisibleReviews(prev => prev + 6)}
            className="w-full bg-white border-2 border-[#56C490] text-[#56C490] font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[12px] transition-all active:scale-95 mb-[20px]"
          >
            Load More Reviews
          </button>
        )}

        {visibleReviews >= allReviews.length && (
          <p className="text-center font-['Nunito',sans-serif] text-[14px] text-[#9CA3AF] mb-[20px]">
            You've reached the end of reviews
          </p>
        )}
      </div>

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
