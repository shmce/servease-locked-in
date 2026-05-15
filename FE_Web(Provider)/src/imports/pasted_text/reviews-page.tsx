import { useState } from "react";
import { useNavigate } from "react-router";
import { Star, ChevronDown, TrendingUp, MessageCircle } from "lucide-react";
import {
  reviewsData,
  ratingDistribution,
  filterTabs,
  sortOptions,
  Review,
} from "./reviewData";
import { ReviewCard } from "./ReviewCard";

export function ReviewsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All Reviews");
  const [sortBy, setSortBy] = useState("Newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const totalReviews = 200;
  const averageRating = 4.8;
  const responseRate = 92;

  const handleRespondClick = (review: Review) => {
    navigate(`/respond/${review.id}`);
  };

  const handleReportClick = (review: Review) => {
    navigate(`/report/${review.id}`);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F7F6' }}>
      <div style={{ margin: '0 auto', backgroundColor: '#F5F7F6', minHeight: '100vh', maxWidth: 390 }}>
        {/* Header */}
        <div style={{
          padding: '56px 20px 20px 20px',
          background: 'linear-gradient(135deg, #00BF63 0%, #00A653 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h1 style={{
                color: 'white',
                fontSize: 22,
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif',
                lineHeight: 1.2,
                margin: 0
              }}>
                Reviews
              </h1>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {/* Avg Rating */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 16,
              padding: 12,
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                <p style={{
                  color: 'white',
                  fontSize: 20,
                  fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif',
                  lineHeight: 1,
                  margin: 0
                }}>
                  {averageRating}
                </p>
                <Star style={{ width: 12, height: 12 }} fill="#FFD700" color="#FFD700" />
              </div>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 10,
                fontFamily: 'Poppins, sans-serif',
                margin: 0
              }}>
                Avg Rating
              </p>
            </div>
            {/* Total Reviews */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 16,
              padding: 12,
              textAlign: 'center'
            }}>
              <p style={{
                color: 'white',
                fontSize: 20,
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif',
                lineHeight: 1,
                margin: 0,
                marginBottom: 4
              }}>
                {totalReviews}
              </p>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 10,
                fontFamily: 'Poppins, sans-serif',
                margin: 0
              }}>
                Total Reviews
              </p>
            </div>
            {/* Response Rate */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 16,
              padding: 12,
              textAlign: 'center'
            }}>
              <p style={{
                color: 'white',
                fontSize: 20,
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif',
                lineHeight: 1,
                margin: 0,
                marginBottom: 4
              }}>
                {responseRate}%
              </p>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 10,
                fontFamily: 'Poppins, sans-serif',
                margin: 0
              }}>
                Response Rate
              </p>
            </div>
          </div>
        </div>

        {/* Rating Distribution Card */}
        <div style={{
          margin: '-4px 16px 12px 16px',
          backgroundColor: 'white',
          borderRadius: 16,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          padding: 16
        }}>
          <p style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#1F2937',
            fontFamily: 'Poppins, sans-serif',
            margin: 0,
            marginBottom: 12
          }}>
            Rating Breakdown
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ratingDistribution.map((item) => (
              <div key={item.stars} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  width: 28,
                  justifyContent: 'flex-end'
                }}>
                  <span style={{
                    fontSize: 12,
                    fontFamily: 'Poppins, sans-serif',
                    color: '#374151'
                  }}>
                    {item.stars}
                  </span>
                  <Star style={{ width: 12, height: 12 }} fill="#FFB800" color="#FFB800" />
                </div>
                <div style={{
                  flex: 1,
                  backgroundColor: '#F3F4F6',
                  borderRadius: 9999,
                  height: 8,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 9999,
                    transition: 'all 0.5s',
                    width: `${item.percentage}%`,
                    background: item.stars >= 4
                      ? '#00BF63'
                      : item.stars === 3
                      ? '#FFB800'
                      : '#F87171'
                  }} />
                </div>
                <span style={{
                  fontSize: 12,
                  fontFamily: 'Poppins, sans-serif',
                  color: '#6B7280',
                  width: 28,
                  textAlign: 'right'
                }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{
          overflowX: 'auto',
          padding: '0 16px',
          marginBottom: 12,
          WebkitOverflowScrolling: 'touch'
        }}>
          <style>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>
          <div style={{ display: 'flex', gap: 8, minWidth: 'max-content', paddingBottom: 4 }}>
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 9999,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 12,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  border: activeFilter === tab ? 'none' : '1px solid #E5E7EB',
                  backgroundColor: activeFilter === tab ? '#00BF63' : 'white',
                  color: activeFilter === tab ? 'white' : '#6B7280',
                  boxShadow: activeFilter === tab ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Sort + Count Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          marginBottom: 12
        }}>
          <p style={{
            fontSize: 13,
            fontFamily: 'Poppins, sans-serif',
            color: '#6B7280',
            margin: 0
          }}>
            <span style={{ fontWeight: 600, color: '#1F2937' }}>{reviewsData.length}</span> reviews
          </p>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                padding: '8px 12px',
                borderRadius: 12,
                fontFamily: 'Poppins, sans-serif',
                fontSize: 12,
                color: '#4B5563',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                cursor: 'pointer'
              }}
            >
              <span>{sortBy}</span>
              <ChevronDown
                style={{
                  width: 14,
                  height: 14,
                  transition: 'transform 0.2s',
                  transform: showSortDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </button>
            {showSortDropdown && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10
                  }}
                  onClick={() => setShowSortDropdown(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 6,
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: 12,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  zIndex: 20,
                  overflow: 'hidden',
                  minWidth: 140
                }}>
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: 13,
                        transition: 'background-color 0.2s',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: sortBy === option ? '#F0FDF8' : 'transparent',
                        color: sortBy === option ? '#00BF63' : '#374151',
                        fontWeight: sortBy === option ? 500 : 400
                      }}
                      onMouseEnter={(e) => {
                        if (sortBy !== option) e.currentTarget.style.backgroundColor = '#F9FAFB';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== option) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Review List */}
        <div style={{ padding: '0 16px 32px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviewsData.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onRespond={handleRespondClick}
              onReport={handleReportClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}