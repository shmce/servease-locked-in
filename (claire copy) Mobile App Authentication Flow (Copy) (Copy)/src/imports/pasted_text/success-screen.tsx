import { Check, BadgeCheck, MapPin, Star } from 'lucide-react';

export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F0FFF6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Phone Frame */}
      <div
        style={{
          width: 390,
          minHeight: 844,
          backgroundColor: '#00BF63',
          borderRadius: 48,
          boxShadow:
            '0 0 0 10px #1a1a1a, 0 0 0 12px #333, 0 30px 80px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Status Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 16,
            paddingLeft: 28,
            paddingRight: 28,
            paddingBottom: 8,
          }}
        >
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'system-ui' }}>
            9:41
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Signal bars */}
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <rect x="0" y="6" width="3" height="6" rx="1" fill="white" />
              <rect x="4.5" y="4" width="3" height="8" rx="1" fill="white" />
              <rect x="9" y="2" width="3" height="10" rx="1" fill="white" />
              <rect x="13.5" y="0" width="3" height="12" rx="1" fill="white" />
            </svg>
            {/* Wifi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M8 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" fill="white" />
              <path d="M4.05 6.55a5.5 5.5 0 017.9 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M1.2 3.7a9.5 9.5 0 0113.6 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {/* Battery */}
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="white" strokeOpacity="0.5" />
              <rect x="2" y="2" width="17" height="8" rx="2" fill="white" />
              <path d="M23 4v4a2 2 0 000-4z" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
        </div>

        {/* Dynamic Island */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div
            style={{
              width: 120,
              height: 34,
              backgroundColor: '#000',
              borderRadius: 20,
            }}
          />
        </div>

        {/* Screen Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: 32,
            paddingRight: 32,
            paddingBottom: 60,
            paddingTop: 20,
          }}
        >
          {/* Success Icon */}
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
              boxShadow: '0 0 0 16px rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check
                style={{ width: 34, height: 34, color: '#00BF63', strokeWidth: 3 }}
              />
            </div>
          </div>

          {/* Heading */}
          <h1
            style={{
              color: '#fff',
              fontSize: 30,
              fontWeight: 800,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              textAlign: 'center',
              letterSpacing: -0.8,
              lineHeight: 1.2,
              marginTop: 20,
              marginBottom: 8,
            }}
          >
            You're All Set!
          </h1>

          {/* Notification Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              paddingTop: 6,
              paddingBottom: 6,
              paddingLeft: 14,
              paddingRight: 14,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#fff',
              }}
            />
            <span
              style={{
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: 0.2,
              }}
            >
              Your profile is live
            </span>
          </div>

          {/* Card */}
          <div
            style={{
              width: '90%',
              backgroundColor: '#fff',
              borderRadius: 24,
              padding: 28,
              boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
            }}
          >
            {/* Quick Stats Header */}
            <p
              style={{
                color: '#9CA3AF',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                marginBottom: 18,
              }}
            >
              Quick Stats
            </p>

            {/* Stat: Profile Completion */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 14,
                borderBottom: '1px solid #F3F4F6',
                marginBottom: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Star style={{ width: 18, height: 18, color: '#00BF63' }} />
                </div>
                <span
                  style={{
                    color: '#374151',
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  Profile completion
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* Progress pill -- removed */}
                <span
                  style={{
                    color: '#00BF63',
                    fontSize: 14,
                    fontWeight: 800,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  100%
                </span>
              </div>
            </div>

            {/* Stat: Verification Level */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 14,
                borderBottom: '1px solid #F3F4F6',
                marginBottom: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BadgeCheck style={{ width: 18, height: 18, color: '#00BF63' }} />
                </div>
                <span
                  style={{
                    color: '#374151',
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  Verification level
                </span>
              </div>
              <span
                style={{
                  color: '#00BF63',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                Verified
              </span>
            </div>

            {/* Stat: Service Area Coverage */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MapPin style={{ width: 18, height: 18, color: '#00BF63' }} />
                </div>
                <span
                  style={{
                    color: '#374151',
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  Service area coverage
                </span>
              </div>
              <span
                style={{
                  color: '#00BF63',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                3 cities
              </span>
            </div>
          </div>

          {/* Primary Button */}
          <button
            style={{
              width: '100%',
              marginTop: 24,
              backgroundColor: '#fff',
              borderRadius: 50,
              paddingTop: 16,
              paddingBottom: 16,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onMouseDown={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)';
            }}
            onMouseUp={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
          >
            <span
              style={{
                color: '#00BF63',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: -0.3,
              }}
            >
              Go to Dashboard
            </span>
          </button>

          {/* Secondary Link */}
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginTop: 18,
              padding: '4px 0',
            }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
                letterSpacing: -0.2,
              }}
            >
              Preview My Profile
            </span>
          </button>
        </div>

        {/* Home Indicator */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingBottom: 12,
          }}
        >
          <div
            style={{
              width: 134,
              height: 5,
              backgroundColor: 'rgba(255,255,255,0.4)',
              borderRadius: 3,
            }}
          />
        </div>
      </div>
    </div>
  );
}