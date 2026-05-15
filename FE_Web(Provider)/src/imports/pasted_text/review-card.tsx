import { MessageSquare, Flag } from "lucide-react";
import { Review } from "./reviewData";
import { StarRating } from "./StarRating";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ReviewCardProps {
  review: Review;
  onRespond: (review: Review) => void;
  onReport: (review: Review) => void;
}

export function ReviewCard({ review, onRespond, onReport }: ReviewCardProps) {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #F3F4F6',
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        {/* Avatar */}
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontWeight: 600,
            fontSize: 14,
            color: '#111827',
            fontFamily: 'Poppins, sans-serif',
            marginBottom: 2,
            margin: 0
          }}>
            {review.customerName}
          </p>
          <StarRating rating={review.rating} />
          <p style={{
            fontSize: 11,
            color: '#9CA3AF',
            fontFamily: 'Poppins, sans-serif',
            marginTop: 2,
            margin: 0
          }}>
            {review.date}
          </p>
        </div>
        {/* Service badge */}
        <div style={{
          backgroundColor: '#F0FDF8',
          color: '#00BF63',
          padding: '4px 10px',
          borderRadius: 999,
          fontSize: 11,
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}>
          {review.serviceType}
        </div>
      </div>

      {/* Review Text */}
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

      {/* Photos */}
      {review.photos.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 12,
          overflowX: 'auto',
          paddingBottom: 4
        }}>
          {review.photos.map((photo, index) => (
            <div
              key={index}
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
                alt={`Review photo ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Business Response */}
      {review.businessResponse && (
        <div style={{
          backgroundColor: '#F8FFFE',
          borderLeft: '2px solid #00BF63',
          borderRadius: '0 8px 8px 0',
          padding: '10px 12px',
          marginBottom: 12
        }}>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#00BF63',
            fontFamily: 'Poppins, sans-serif',
            margin: 0,
            marginBottom: 4
          }}>
            Your Response
          </p>
          <p style={{
            fontSize: 12,
            fontFamily: 'Poppins, sans-serif',
            color: '#4B5563',
            lineHeight: 1.7,
            margin: 0
          }}>
            {review.businessResponse}
          </p>
        </div>
      )}

      {/* Divider */}
      <div style={{
        borderTop: '1px solid #F3F4F6',
        paddingTop: 12,
        display: 'flex',
        gap: 8
      }}>
        {!review.businessResponse && (
          <button
            onClick={() => onRespond(review)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: '#00BF63',
              color: 'white',
              padding: '10px 12px',
              borderRadius: 12,
              fontFamily: 'Poppins, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#00A653'}
            onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#00BF63'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00BF63'}
          >
            <MessageSquare style={{ width: 14, height: 14 }} />
            Respond
          </button>
        )}
        <button
          onClick={() => onReport(review)}
          style={{
            ...(review.businessResponse ? { flex: 1 } : {}),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: '#F9FAFB',
            color: '#6B7280',
            border: '1px solid #E5E7EB',
            padding: '10px 12px',
            borderRadius: 12,
            fontFamily: 'Poppins, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
          onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
        >
          <Flag style={{ width: 14, height: 14 }} />
          Report
        </button>
      </div>
    </div>
  );
}