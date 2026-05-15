import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChevronLeft,
  ChevronDown,
  Upload,
  X,
  AlertCircle,
  Info,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import { reviewsData, reportReasons } from "./reviewData";
import { StarRating } from "./StarRating";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function ReportReviewPage() {
  const navigate = useNavigate();
  const { reviewId } = useParams();
  const review = reviewsData.find((r) => r.id === Number(reviewId));

  const [selectedReason, setSelectedReason] = useState("");
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxChars = 500;
  const isOther = selectedReason === "Other";
  const isValid =
    selectedReason.length > 0 &&
    (isOther ? additionalDetails.trim().length > 0 : true);

  const showReasonError = touched && !selectedReason;
  const showDetailsError = touched && isOther && !additionalDetails.trim();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const images = files.filter((f) => f.type.startsWith("image/"));
    setUploadedFiles((prev) => [...prev, ...images].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    console.log("Report submitted:", {
      reviewId: review?.id,
      reason: selectedReason,
      details: additionalDetails,
      filesCount: uploadedFiles.length,
    });
    setSubmitted(true);
  };

  // Success Screen
  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F5F7F6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        maxWidth: 390,
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: 24,
          padding: 32,
          textAlign: 'center',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          width: '100%'
        }}>
          <div style={{
            width: 64,
            height: 64,
            backgroundColor: '#F0FDF8',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <CheckCircle2 style={{ width: 36, height: 36, color: '#00BF63' }} />
          </div>
          <h2 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#111827',
            fontFamily: 'Poppins, sans-serif',
            margin: 0,
            marginBottom: 8
          }}>
            Report Submitted
          </h2>
          <p style={{
            fontSize: 13,
            color: '#6B7280',
            fontFamily: 'Poppins, sans-serif',
            lineHeight: 1.7,
            margin: 0,
            marginBottom: 24
          }}>
            Your report has been received. Our team will review it within 24–48
            hours and take appropriate action.
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

  // No Review Guard
  if (!review) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F5F7F6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
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
            Please go back and select a review to report.
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
                Report Review
              </h1>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px 144px 16px'
        }}>
          {/* Review Being Reported */}
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
            Review Being Reported
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

          {/* Report Reason */}
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
            Report Details
          </p>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 16,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            marginBottom: 12,
            overflow: 'visible'
          }}>
            <div style={{ padding: '16px 16px 16px 16px' }}>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
                fontFamily: 'Poppins, sans-serif',
                marginBottom: 8
              }}>
                Reason for Reporting <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowReasonDropdown(!showReasonDropdown)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 12,
                    border: `1px solid ${
                      showReasonError
                        ? '#F87171'
                        : selectedReason
                        ? '#00BF63'
                        : '#E5E7EB'
                    }`,
                    borderRadius: 12,
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 14,
                    backgroundColor: showReasonError
                      ? '#FEF2F2'
                      : selectedReason
                      ? '#F0FDF8'
                      : 'white',
                    transition: 'border-color 0.2s, background-color 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedReason && !showReasonError) {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedReason && !showReasonError) {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                    }
                  }}
                >
                  <span style={{ color: selectedReason ? '#1F2937' : '#9CA3AF' }}>
                    {selectedReason || "Select a reason..."}
                  </span>
                  <ChevronDown
                    style={{
                      width: 16,
                      height: 16,
                      transition: 'transform 0.2s',
                      transform: showReasonDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                      color: selectedReason ? '#00BF63' : '#9CA3AF'
                    }}
                  />
                </button>
                {showReasonDropdown && (
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 10
                      }}
                      onClick={() => setShowReasonDropdown(false)}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: 4,
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: 12,
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      zIndex: 20,
                      overflow: 'hidden'
                    }}>
                      {reportReasons.map((reason) => (
                        <button
                          key={reason}
                          onClick={() => {
                            setSelectedReason(reason);
                            setShowReasonDropdown(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 12,
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: 13,
                            transition: 'background-color 0.2s',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: selectedReason === reason ? '#F0FDF8' : 'transparent',
                            color: selectedReason === reason ? '#00BF63' : '#374151',
                            fontWeight: selectedReason === reason ? 600 : 400
                          }}
                          onMouseEnter={(e) => {
                            if (selectedReason !== reason) e.currentTarget.style.backgroundColor = '#F9FAFB';
                          }}
                          onMouseLeave={(e) => {
                            if (selectedReason !== reason) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <span>{reason}</span>
                          {selectedReason === reason && (
                            <CheckCircle2 style={{ width: 16, height: 16, color: '#00BF63' }} />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {showReasonError && (
                <p style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#EF4444',
                  fontSize: 12,
                  fontFamily: 'Poppins, sans-serif',
                  margin: 0,
                  marginTop: 6
                }}>
                  <AlertCircle style={{ width: 14, height: 14 }} />
                  Please select a reason for reporting
                </p>
              )}
            </div>

            {/* Additional Details */}
            <div style={{
              borderTop: '1px solid #F3F4F6',
              padding: 16
            }}>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
                fontFamily: 'Poppins, sans-serif',
                marginBottom: 8
              }}>
                Additional Details{" "}
                {isOther ? (
                  <span style={{ color: '#EF4444' }}>*</span>
                ) : (
                  <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span>
                )}
              </label>
              <div style={{
                border: `1px solid ${
                  showDetailsError
                    ? '#F87171'
                    : additionalDetails.length > 0
                    ? '#00BF63'
                    : '#E5E7EB'
                }`,
                borderRadius: 12,
                overflow: 'hidden',
                transition: 'border-color 0.2s'
              }}>
                <textarea
                  value={additionalDetails}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars) {
                      setAdditionalDetails(e.target.value);
                    }
                  }}
                  placeholder={
                    isOther
                      ? "Please describe your reason in detail..."
                      : "Add any extra context to support your report..."
                  }
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px 8px 16px',
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
                  justifyContent: 'flex-end',
                  padding: '0 16px 8px 16px',
                  borderTop: '1px solid #F9FAFB'
                }}>
                  <span style={{
                    fontSize: 11,
                    fontFamily: 'Poppins, sans-serif',
                    color: additionalDetails.length >= maxChars ? '#EF4444' : '#9CA3AF'
                  }}>
                    {additionalDetails.length}/{maxChars}
                  </span>
                </div>
              </div>
              {showDetailsError && (
                <p style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#EF4444',
                  fontSize: 12,
                  fontFamily: 'Poppins, sans-serif',
                  margin: 0,
                  marginTop: 6
                }}>
                  <AlertCircle style={{ width: 14, height: 14 }} />
                  Details are required when selecting "Other"
                </p>
              )}
            </div>
          </div>

          {/* Evidence Upload */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: 16,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            marginBottom: 12,
            padding: 16
          }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#374151',
              fontFamily: 'Poppins, sans-serif',
              marginBottom: 4
            }}>
              Evidence Upload{" "}
              <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span>
            </label>
            <p style={{
              fontSize: 12,
              color: '#9CA3AF',
              fontFamily: 'Poppins, sans-serif',
              margin: 0,
              marginBottom: 12
            }}>
              Upload screenshots to support your report (max 5 images)
            </p>

            {/* Drop Zone */}
            {uploadedFiles.length < 5 && (
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                boxSizing: 'border-box',
                padding: '20px',
                border: '2px dashed #E5E7EB',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'border-color 0.2s, background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00BF63';
                e.currentTarget.style.backgroundColor = '#F0FDF8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}>
                  <Upload style={{ width: 20, height: 20, color: '#9CA3AF' }} />
                </div>
                <span style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 13,
                  color: '#6B7280',
                  fontWeight: 500
                }}>
                  Tap to upload images
                </span>
                <span style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 11,
                  color: '#9CA3AF'
                }}>
                  PNG, JPG up to 10MB each
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}

            {/* File List */}
            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {uploadedFiles.map((file, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      backgroundColor: '#F9FAFB',
                      borderRadius: 12,
                      padding: 12
                    }}
                  >
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      overflow: 'hidden',
                      backgroundColor: '#E5E7EB',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <ImageIcon style={{ width: 20, height: 20, color: '#9CA3AF' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 13,
                        fontFamily: 'Poppins, sans-serif',
                        color: '#374151',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        margin: 0
                      }}>
                        {file.name}
                      </p>
                      <p style={{
                        fontSize: 11,
                        fontFamily: 'Poppins, sans-serif',
                        color: '#9CA3AF',
                        margin: 0
                      }}>
                        {(file.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: '#E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#D1D5DB'}
                      onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                    >
                      <X style={{ width: 16, height: 16, color: '#6B7280' }} />
                    </button>
                  </div>
                ))}
                {uploadedFiles.length < 5 && (
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '10px',
                    border: '1px dashed #D1D5DB',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00BF63'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                  >
                    <Upload style={{ width: 16, height: 16, color: '#9CA3AF' }} />
                    <span style={{
                      fontSize: 13,
                      fontFamily: 'Poppins, sans-serif',
                      color: '#6B7280'
                    }}>
                      Add more ({5 - uploadedFiles.length} remaining)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Important Info */}
          <div style={{
            backgroundColor: '#FFF7ED',
            border: '1px solid #FED7AA',
            borderRadius: 16,
            padding: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#FFEDD5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 2
              }}>
                <AlertCircle style={{ width: 16, height: 16, color: '#F97316' }} />
              </div>
              <div>
                <p style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#C2410C',
                  fontFamily: 'Poppins, sans-serif',
                  margin: 0,
                  marginBottom: 4
                }}>
                  Important Information
                </p>
                <p style={{
                  fontSize: 12,
                  fontFamily: 'Poppins, sans-serif',
                  color: '#EA580C',
                  lineHeight: 1.7,
                  margin: 0
                }}>
                  Reports are reviewed within 24–48 hours. False reports may
                  result in account penalties. All submitted information is kept
                  confidential.
                </p>
              </div>
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
              style={{
                flex: 1,
                backgroundColor: '#00BF63',
                color: 'white',
                padding: '14px 16px',
                borderRadius: 12,
                fontFamily: 'Poppins, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#00A653'}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#00BF63'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00BF63'}
            >
              Submit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}