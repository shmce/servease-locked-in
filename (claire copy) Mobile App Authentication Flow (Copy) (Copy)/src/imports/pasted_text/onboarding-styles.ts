import { useState, useRef, CSSProperties } from 'react';
import { CalendarCheck, MapPin, ListChecks, Wallet, Star, AlertCircle } from 'lucide-react';

const GREEN = '#00BF63';
const GREEN_DARK = '#00a855';
const GREEN_SHADOW = 'rgba(0,191,99,0.25)';
const FONT = 'Poppins, sans-serif';

interface SlideData {
  title: string;
  description: string;
  permissionText?: string;
  icon: React.ReactNode;
}

const slides: SlideData[] = [
  {
    title: 'Accept Bookings',
    description:
      'View new service requests from nearby customers and accept jobs that match your schedule. Stay organized and never miss an opportunity.',
    icon: <CalendarCheck size={80} color="#fff" strokeWidth={1.5} />,
  },
  {
    title: 'Using GPS Tracking',
    description:
      'Enable location services so customers can see your real-time arrival updates. This helps build trust and keeps everyone informed.',
    permissionText: 'Please turn on location access for accurate tracking.',
    icon: <MapPin size={80} color="#fff" strokeWidth={1.5} />,
  },
  {
    title: 'Service Delivery Process',
    description:
      "Accept bookings and message customers directly through the app. Once you complete the job, your payment is processed automatically and you'll earn a rating.",
    icon: <ListChecks size={80} color="#fff" strokeWidth={1.5} />,
  },
  {
    title: 'Getting Paid',
    description:
      'Receive secure payments directly through the app after completing each job. Track your earnings and payment history anytime.',
    icon: <Wallet size={80} color="#fff" strokeWidth={1.5} />,
  },
  {
    title: 'Building Reputation',
    description:
      'Great service leads to positive reviews. Maintain high ratings to attract more customers and grow your opportunities.',
    permissionText: 'Allow notifications to receive new booking alerts and reviews.',
    icon: <Star size={80} color="#fff" strokeWidth={1.5} />,
  },
];

/* ─── Style objects ─────────────────────────────────────── */

const s = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
  } as CSSProperties,

  phone: {
    position: 'relative',
    width: 390,
    height: 844,
    background: '#ffffff',
    borderRadius: 40,
    boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  } as CSSProperties,

  // Swiper track wrapper
  trackWrapper: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  } as CSSProperties,

  // Slides track – translated via JS
  track: (offsetX: number, dragging: boolean): CSSProperties => ({
    display: 'flex',
    height: '100%',
    transform: `translateX(${offsetX}px)`,
    transition: dragging ? 'none' : 'transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    willChange: 'transform',
  }),

  slide: {
    minWidth: 390,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 32px 200px',
    position: 'relative',
    boxSizing: 'border-box',
  } as CSSProperties,

  // Decorative blobs
  blobTopRight: {
    position: 'absolute',
    top: 80,
    right: 40,
    width: 128,
    height: 128,
    borderRadius: '50%',
    background: 'rgba(0,191,99,0.10)',
    filter: 'blur(32px)',
    pointerEvents: 'none',
  } as CSSProperties,

  blobBottomLeft: {
    position: 'absolute',
    bottom: 160,
    left: 40,
    width: 160,
    height: 160,
    borderRadius: '50%',
    background: 'rgba(0,191,99,0.05)',
    filter: 'blur(48px)',
    pointerEvents: 'none',
  } as CSSProperties,

  iconCard: {
    position: 'relative',
    background: GREEN,
    borderRadius: 32,
    padding: 40,
    marginBottom: 40,
    boxShadow: `0 20px 48px ${GREEN_SHADOW}`,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,

  iconCardOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.20), transparent)',
    pointerEvents: 'none',
  } as CSSProperties,

  textBlock: {
    textAlign: 'center',
    maxWidth: 310,
  } as CSSProperties,

  title: {
    fontSize: 28,
    fontWeight: 700,
    fontFamily: FONT,
    color: '#111827',
    lineHeight: 1.25,
    margin: '0 0 16px',
    padding: '0 16px',
  } as CSSProperties,

  description: {
    fontSize: 15,
    fontFamily: FONT,
    color: '#4B5563',
    lineHeight: 1.65,
    margin: 0,
    padding: '0 8px',
  } as CSSProperties,

  alertBox: {
    marginTop: 24,
    background: '#FFFBEB',
    border: '2px solid #FDE68A',
    borderRadius: 16,
    padding: '14px 16px',
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    textAlign: 'left',
  } as CSSProperties,

  alertText: {
    fontSize: 13,
    fontFamily: FONT,
    color: '#92400E',
    fontWeight: 500,
    lineHeight: 1.55,
    margin: 0,
  } as CSSProperties,

  // Bottom nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: '#ffffff',
    padding: '20px 24px 36px',
    borderTop: '1px solid #F3F4F6',
  } as CSSProperties,

  dotsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  } as CSSProperties,

  dot: (active: boolean): CSSProperties => ({
    height: 8,
    width: active ? 32 : 8,
    borderRadius: 99,
    background: active ? GREEN : '#D1D5DB',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    transition: 'width 0.3s ease, background 0.3s ease',
  }),

  nextBtn: (hovered: boolean): CSSProperties => ({
    width: '100%',
    background: hovered ? GREEN_DARK : GREEN,
    color: '#ffffff',
    border: 'none',
    borderRadius: 99,
    padding: '16px 0',
    fontSize: 16,
    fontFamily: FONT,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: `0 8px 24px ${GREEN_SHADOW}`,
    transition: 'background 0.2s ease, transform 0.15s ease',
    transform: hovered ? 'scale(1.02)' : 'scale(1)',
    marginBottom: 12,
  }),

  skipBtn: (hovered: boolean): CSSProperties => ({
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: hovered ? '#374151' : '#6B7280',
    fontSize: 14,
    fontFamily: FONT,
    fontWeight: 500,
    cursor: 'pointer',
    padding: '8px 0',
    transition: 'color 0.2s ease',
  }),

  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 134,
    height: 5,
    background: '#000000',
    borderRadius: 99,
    opacity: 0.3,
    pointerEvents: 'none',
  } as CSSProperties,
};

/* ─── Component ─────────────────────────────────────────── */

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const [nextHovered, setNextHovered] = useState(false);
  const [skipHovered, setSkipHovered] = useState(false);

  // Touch / drag state
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number>(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const baseOffset = -(current * 390);

  /* Navigation helpers */
  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    setCurrent(clamped);
    setDragOffset(0);
    setIsDragging(false);
  };

  const handleNext = () => {
    if (current < slides.length - 1) {
      goTo(current + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => handleComplete();

  const handleComplete = () => {
    console.log('Onboarding completed');
  };

  /* Touch handlers */
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    touchCurrentX.current = e.touches[0].clientX;

    // Resist at edges
    const atStart = current === 0 && diff > 0;
    const atEnd = current === slides.length - 1 && diff < 0;
    const resistance = atStart || atEnd ? 0.25 : 1;
    setDragOffset(diff * resistance);
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null) return;
    const diff = touchCurrentX.current - touchStartX.current;
    const threshold = 50;

    if (diff < -threshold && current < slides.length - 1) {
      goTo(current + 1);
    } else if (diff > threshold && current > 0) {
      goTo(current - 1);
    } else {
      setDragOffset(0);
      setIsDragging(false);
    }
    touchStartX.current = null;
  };

  return (
    <div style={s.page}>
      <div style={s.phone}>
        {/* ── Swipeable track ── */}
        <div
          style={s.trackWrapper}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div style={s.track(baseOffset + dragOffset, isDragging)}>
            {slides.map((slide, i) => (
              <SlideView key={i} slide={slide} />
            ))}
          </div>
        </div>

        {/* ── Bottom navigation ── */}
        <div style={s.bottomNav}>
          {/* Progress dots */}
          <div style={s.dotsRow}>
            {slides.map((_, i) => (
              <button
                key={i}
                style={s.dot(i === current)}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <button
            style={s.nextBtn(nextHovered)}
            onClick={handleNext}
            onMouseEnter={() => setNextHovered(true)}
            onMouseLeave={() => setNextHovered(false)}
          >
            {current === slides.length - 1 ? 'Get Started' : 'Next'}
          </button>
          <button
            style={s.skipBtn(skipHovered)}
            onClick={handleSkip}
            onMouseEnter={() => setSkipHovered(true)}
            onMouseLeave={() => setSkipHovered(false)}
          >
            Skip Tutorial
          </button>
        </div>

        {/* iOS home indicator */}
        <div style={s.homeIndicator} />
      </div>
    </div>
  );
}

/* ─── Slide view ─────────────────────────────────────────── */

function SlideView({ slide }: { slide: SlideData }) {
  return (
    <div style={s.slide}>
      {/* Background blobs */}
      <div style={s.blobTopRight} />
      <div style={s.blobBottomLeft} />

      {/* Icon card */}
      <div style={s.iconCard}>
        <div style={s.iconCardOverlay} />
        <div style={{ position: 'relative', zIndex: 1 }}>{slide.icon}</div>
      </div>

      {/* Text */}
      <div style={s.textBlock}>
        <h2 style={s.title}>{slide.title}</h2>
        <p style={s.description}>{slide.description}</p>

        {slide.permissionText && (
          <div style={s.alertBox}>
            <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={s.alertText}>{slide.permissionText}</p>
          </div>
        )}
      </div>
    </div>
  );
}