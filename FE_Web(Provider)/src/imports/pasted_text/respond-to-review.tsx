import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Info, Send } from "lucide-react";
import { reviewsData } from "./reviewData";
import { StarRating } from "./StarRating";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const tips = [
  { label: "Be professional", detail: "Maintain a courteous and respectful tone throughout" },
  { label: "Thank the customer", detail: "Show appreciation for their feedback" },
  { label: "Address concerns", detail: "Acknowledge and respond to specific issues raised" },
  { label: "Keep it concise", detail: "Be clear and to the point — avoid lengthy responses" },
];

export function RespondToReviewPage() {
  const navigate = useNavigate();
  const { reviewId } = useParams();
  const review = reviewsData.find((r) => r.id === Number(reviewId));

  const [response, setResponse] = useState("");
  const maxCharacters = 500;
  const charCount = response.length;
  const isOverLimit = charCount >= maxCharacters;

  const handleSubmit = () => {
    if (response.trim().length === 0) return;
    console.log("Submitting response:", { reviewId: review?.id, response });
    navigate("/");
  };

  if (!review) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F5F7F6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
        maxWidth: 390,
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          width: '100%'
        }}>
          <div style={{
            width: 64,
            height: 64,
            backgroundColor: '#F3F4F6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <Info style={{ width: 32, height: 32, color: '#9CA3AF' }} />
          </div>
          <p style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#1F2937',
            fontFamily: 'Poppins, sans-serif',
            margin: 0,
            marginBottom: 4
          }}>
            No Review Selected
          </p>
          <p style={{
            fontSize: 13,
            color: '#6B7280',
            fontFamily: 'Poppins, sans-serif',
            margin: 0,
            marginBottom: 20
          }}>
            Please go back and select a review to respond to.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              width: '100%',
              backgroundColor: '#00BF63',
              color: 'white',
              padding: '12px',
              borderRadius: 12,
              fontFamily: 'Poppins, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Back to Reviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F7F6' }}>
      <div style={{
        margin: '0 auto',
        backgroundColor: '#F5F7F6',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 390
      }}>
        {/* Header */}
        <div style={{
          padding: '56px 20px 20px 20px',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #00BF63 0%, #00A653 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate("/")}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              <ChevronLeft style={{ width: 20, height: 20, color: 'white' }} />
            </button>
            <div>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 11,
                fontFamily: 'Poppins, sans-serif',
                margin: 0
              }}>
                Reviews
              </p>
              <h1 style={{
                color: 'white',
                fontSize: 18,
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif',
                lineHeight: 1.2,
                margin: 0
              }}>
                Respond to Review
              </h1>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px 128px 16px'
        }}>
          {/* Original Review */}
          <p style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#9CA3AF',
            fontFamily: 'Poppins, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0 4px',
            margin: 0,
            marginBottom: 8
          }}>
            Original Review
          </p>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 191, 99, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#00BF63',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {review.avatar}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#111827',
                  fontFamily: 'Poppins, sans-serif',
                  margin: 0,
                  marginBottom: 2
                }}>
                  {review.customerName}
                </p>
                <StarRating rating={review.rating} />
                <p style={{
                  fontSize: 11,
                  color: '#9CA3AF',
                  fontFamily: 'Poppins, sans-serif',
                  margin: 0,
                  marginTop: 2
                }}>
                  {review.date}
                </p>
              </div>
              <div style={{
                backgroundColor: '#F0FDF8',
                color: '#00BF63',
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 11,
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                whiteSpace: 'nowrap'
              }}>
                {review.serviceType}
              </div>
            </div>
            <p style={{
              fontSize: 13,
              fontFamily: 'Poppins, sans-serif',
              color: '#4B5563',
              lineHeight: 1.7,
              margin: 0,
              marginBottom: 12
            }}>
              {review.reviewText}
            </p>
            {review.photos.length > 0 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {review.photos.map((photo, i) => (
                  <div
                    key={i}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: '#F3F4F6'
                    }}
                  >
                    <ImageWithFallback
                      src={photo}
                      alt={`Photo ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Response Input */}
          <p style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#9CA3AF',
            fontFamily: 'Poppins, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0 4px',
            margin: 0,
            marginBottom: 8
          }}>
            Your Response
          </p>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 16,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            marginBottom: 16,
            overflow: 'hidden'
          }}>
            <textarea
              value={response}
              onChange={(e) => {
                if (e.target.value.length <= maxCharacters) {
                  setResponse(e.target.value);
                }
              }}
              placeholder="Write a professional response to this review..."
              style={{
                width: '100%',
                height: 144,
                padding: '16px 16px 8px 16px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: 14,
                color: '#374151',
                resize: 'none',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                lineHeight: 1.6
              }}
            />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px 12px 16px',
              borderTop: '1px solid #F3F4F6'
            }}>
              <span style={{
                fontSize: 12,
                fontFamily: 'Poppins, sans-serif',
                color: isOverLimit ? '#EF4444' : '#9CA3AF'
              }}>
                {charCount}/{maxCharacters} characters
              </span>
              {charCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    height: 6,
                    borderRadius: 9999,
                    backgroundColor: '#F3F4F6',
                    overflow: 'hidden',
                    width: 60
                  }}>
                    <div style={{
                      height: '100%',
                      borderRadius: 9999,
                      transition: 'all 0.2s',
                      backgroundColor: isOverLimit ? '#F87171' : charCount > 400 ? '#FBBF24' : '#00BF63',
                      width: `${(charCount / maxCharacters) * 100}%`
                    }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <p style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#9CA3AF',
            fontFamily: 'Poppins, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0 4px',
            margin: 0,
            marginBottom: 8
          }}>
            Tips for Responding
          </p>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 16,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            marginBottom: 16
          }}>
            <div style={{
              backgroundColor: '#F0FDF8',
              padding: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: '1px solid rgba(0, 191, 99, 0.1)'
            }}>
              <Info style={{ width: 16, height: 16, color: '#00BF63' }} />
              <p style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#00BF63',
                fontFamily: 'Poppins, sans-serif',
                margin: 0
              }}>
                Best Practices
              </p>
            </div>
            <div>
              {tips.map((tip, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    borderTop: i > 0 ? '1px solid #F9FAFB' : 'none'
                  }}
                >
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 191, 99, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#00BF63' }}>{i + 1}</span>
                  </div>
                  <div>
                    <p style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#1F2937',
                      fontFamily: 'Poppins, sans-serif',
                      margin: 0
                    }}>
                      {tip.label}
                    </p>
                    <p style={{
                      fontSize: 12,
                      color: '#6B7280',
                      fontFamily: 'Poppins, sans-serif',
                      lineHeight: 1.7,
                      margin: 0
                    }}>
                      {tip.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Buttons */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '1px solid #F3F4F6',
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 10
        }}>
          <div style={{
            margin: '0 auto',
            padding: 16,
            display: 'flex',
            gap: 12,
            maxWidth: 390
          }}>
            <button
              onClick={() => navigate("/")}
              style={{
                flex: 1,
                backgroundColor: '#F3F4F6',
                color: '#4B5563',
                padding: '14px 16px',
                borderRadius: 12,
                fontFamily: 'Poppins, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={response.trim().length === 0}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 16px',
                borderRadius: 12,
                fontFamily: 'Poppins, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                whiteSpace: 'nowrap',
                cursor: response.trim().length === 0 ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: response.trim().length === 0 ? '#E5E7EB' : '#00BF63',
                color: response.trim().length === 0 ? '#9CA3AF' : 'white'
              }}
              onMouseDown={(e) => {
                if (response.trim().length > 0) {
                  e.currentTarget.style.backgroundColor = '#00A653';
                }
              }}
              onMouseUp={(e) => {
                if (response.trim().length > 0) {
                  e.currentTarget.style.backgroundColor = '#00BF63';
                }
              }}
              onMouseLeave={(e) => {
                if (response.trim().length > 0) {
                  e.currentTarget.style.backgroundColor = '#00BF63';
                }
              }}
            >
              <Send style={{ width: 16, height: 16 }} />
              Submit Response
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}