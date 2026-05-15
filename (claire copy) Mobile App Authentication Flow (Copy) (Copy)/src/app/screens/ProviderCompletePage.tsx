import { useNavigate } from 'react-router';
import { Check, BadgeCheck, MapPin, Star } from 'lucide-react';
import { StatusBar } from '../components/StatusBar';

const GREEN = '#56C490';
const FONT = "'Inter', sans-serif";

export default function ProviderCompletePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#56C490] w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
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
              style={{ width: 34, height: 34, color: GREEN, strokeWidth: 3 }}
            />
          </div>
        </div>

        {/* Heading */}
        <h1
          style={{
            color: '#fff',
            fontSize: 30,
            fontWeight: 800,
            fontFamily: FONT,
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
              fontFamily: FONT,
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
              fontFamily: FONT,
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
                <Star style={{ width: 18, height: 18, color: GREEN }} />
              </div>
              <span
                style={{
                  color: '#374151',
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: FONT,
                }}
              >
                Profile completion
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  color: GREEN,
                  fontSize: 14,
                  fontWeight: 800,
                  fontFamily: FONT,
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
                <BadgeCheck style={{ width: 18, height: 18, color: GREEN }} />
              </div>
              <span
                style={{
                  color: '#374151',
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: FONT,
                }}
              >
                Verification level
              </span>
            </div>
            <span
              style={{
                color: GREEN,
                fontSize: 14,
                fontWeight: 700,
                fontFamily: FONT,
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
                <MapPin style={{ width: 18, height: 18, color: GREEN }} />
              </div>
              <span
                style={{
                  color: '#374151',
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: FONT,
                }}
              >
                Service area coverage
              </span>
            </div>
            <span
              style={{
                color: GREEN,
                fontSize: 14,
                fontWeight: 700,
                fontFamily: FONT,
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
          onClick={() => navigate('/provider/home')}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)';
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          <span
            style={{
              color: GREEN,
              fontSize: 16,
              fontWeight: 700,
              fontFamily: FONT,
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
          onClick={() => navigate('/provider/profile/1')}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: FONT,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              letterSpacing: -0.2,
            }}
          >
            Preview My Profile
          </span>
        </button>
      </div>

      {/* iOS home indicator */}
      <div
        style={{
          height: 5,
          width: 134,
          background: 'rgba(255,255,255,0.4)',
          borderRadius: 3,
          margin: '8px auto 12px',
          flexShrink: 0,
        }}
      />
    </div>
  );
}