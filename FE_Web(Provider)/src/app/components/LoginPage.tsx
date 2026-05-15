import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Calendar, DollarSign, Star } from 'lucide-react';
import logo from '../../assets/d5c1631be6e8531539bd8040a765725f4a4ddc2c.png';
import { useProviderAuth } from '../context/ProviderAuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearSessionExpired, isAuthenticated, isLoading: isSessionLoading, login, sessionExpired } = useProviderAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fromPath =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/provider/dashboard';

  useEffect(() => {
    if (!isSessionLoading && isAuthenticated) {
      navigate(fromPath, { replace: true });
    }
  }, [fromPath, isAuthenticated, isSessionLoading, navigate]);

  useEffect(() => {
    if (sessionExpired) {
      setError('Your provider session expired. Please sign in again.');
      clearSessionExpired();
    }
  }, [clearSessionExpired, sessionExpired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.error || 'Incorrect email or password.');
        return;
      }

      navigate(fromPath, { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Incorrect email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    padding: '0',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

  const mainCardStyle: React.CSSProperties = {
    width: '100%',
    height: '100vh',
    maxWidth: '100%',
    background: '#ffffff',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
  };

  const leftPanelStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #00BF63 0%, #16A34A 60%, #15803D 100%)',
    padding: '4rem 3rem',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  const decorativeShape1Style: React.CSSProperties = {
    position: 'absolute',
    top: '-10%',
    right: '-15%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
  };

  const decorativeShape2Style: React.CSSProperties = {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 50%, transparent 100%)',
  };

  const decorativeShape3Style: React.CSSProperties = {
    position: 'absolute',
    top: '40%',
    left: '5%',
    width: '150px',
    height: '150px',
    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
    background: 'rgba(255, 255, 255, 0.08)',
    filter: 'blur(40px)',
  };

  const contentWrapperStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 10,
    maxWidth: '500px',
    margin: '0 auto',
  };

  const headlineStyle: React.CSSProperties = {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '1.25rem',
    lineHeight: '1.1',
  };

  const taglineStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '3.5rem',
    lineHeight: '1.6',
  };

  const featuresContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  };

  const featureItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.25rem',
  };

  const featureIconStyle: React.CSSProperties = {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.18)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  const featureTitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  };

  const featureDescStyle: React.CSSProperties = {
    fontSize: '0.9375rem',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: '1.6',
  };

  const rightPanelStyle: React.CSSProperties = {
    padding: '4rem 3rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#ffffff',
  };

  const formContainerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '440px',
  };

  const mobileLogoStyle: React.CSSProperties = {
    marginBottom: '2rem',
    textAlign: 'center',
  };

  const mobileLogoImgStyle: React.CSSProperties = {
    height: '40px',
    width: 'auto',
  };

  const formHeaderStyle: React.CSSProperties = {
    marginBottom: '2.5rem',
  };

  const formTitleStyle: React.CSSProperties = {
    fontSize: '2.25rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.5rem',
    letterSpacing: '-0.02em',
  };

  const formSubtitleStyle: React.CSSProperties = {
    fontSize: '1rem',
    color: '#64748b',
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  };

  const errorStyle: React.CSSProperties = {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '500',
  };

  const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#334155',
  };

  const inputWrapperStyle: React.CSSProperties = {
    position: 'relative',
  };

  const inputIconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '1.125rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: '#94a3b8',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.9375rem 1.125rem 0.9375rem 3.25rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    background: '#ffffff',
    color: '#0f172a',
  };

  const eyeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: '1.125rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    transition: 'color 0.2s ease',
  };

  const rememberForgotStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const checkboxLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#475569',
    fontWeight: '500',
  };

  const checkboxStyle: React.CSSProperties = {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#00BF63',
  };

  const forgotLinkStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#00BF63',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  };

  const submitButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, #00BF63 0%, #16A34A 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.625rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(0, 191, 99, 0.25)',
  };

  const submitButtonDisabledStyle: React.CSSProperties = {
    opacity: 0.6,
    cursor: 'not-allowed',
  };

  const footerStyle: React.CSSProperties = {
    marginTop: '2rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#64748b',
  };

  const applyLinkStyle: React.CSSProperties = {
    fontWeight: '600',
    color: '#00BF63',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  };

  const dividerStyle: React.CSSProperties = {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid #e2e8f0',
  };

  const linksContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
    fontSize: '0.8125rem',
    color: '#94a3b8',
  };

  const linkButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    transition: 'color 0.2s ease',
  };

  const spinnerStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    border: '2.5px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          .login-input:hover {
            border-color: #cbd5e1 !important;
          }
          
          .login-input:focus {
            border-color: #00BF63 !important;
            box-shadow: 0 0 0 4px rgba(0, 191, 99, 0.1) !important;
          }
          
          .forgot-link:hover {
            color: #16A34A !important;
          }
          
          .apply-link:hover {
            color: #16A34A !important;
          }
          
          .footer-link:hover {
            color: #64748b !important;
          }
          
          .submit-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(0, 191, 99, 0.35) !important;
          }
          
          .eye-btn:hover {
            color: #64748b !important;
          }
          
          @media (max-width: 1024px) {
            .left-panel {
              display: none !important;
            }
          }
          
          @media (max-width: 640px) {
            .right-panel {
              padding: 2rem 1.5rem !important;
            }
          }
          
          .mobile-logo {
            display: none;
          }
          
          @media (max-width: 1024px) {
            .mobile-logo {
              display: block !important;
            }
          }
        `}
      </style>
      
      <div style={containerStyle}>
        <div style={mainCardStyle}>
          {/* Left Panel - Branding */}
          <div style={leftPanelStyle} className="left-panel">
            {/* Decorative Elements */}
            <div style={decorativeShape1Style}></div>
            <div style={decorativeShape2Style}></div>
            <div style={decorativeShape3Style}></div>

            <div style={contentWrapperStyle}>
              {/* Headline */}
              <h1 style={headlineStyle}>
                Welcome to<br />ServEase
              </h1>

              {/* Tagline */}
              <p style={taglineStyle}>
                Empowering service providers to grow their business and manage everything in one place.
              </p>

              {/* Features */}
              <div style={featuresContainerStyle}>
                <div style={featureItemStyle}>
                  <div style={featureIconStyle}>
                    <Calendar size={26} strokeWidth={2.2} />
                  </div>
                  <div>
                    <div style={featureTitleStyle}>Manage Bookings</div>
                    <div style={featureDescStyle}>
                      Easy-to-use calendar and scheduling tools to streamline your workflow
                    </div>
                  </div>
                </div>

                <div style={featureItemStyle}>
                  <div style={featureIconStyle}>
                    <DollarSign size={26} strokeWidth={2.2} />
                  </div>
                  <div>
                    <div style={featureTitleStyle}>Track Earnings</div>
                    <div style={featureDescStyle}>
                      Real-time insights into your income and financial performance
                    </div>
                  </div>
                </div>

                <div style={featureItemStyle}>
                  <div style={featureIconStyle}>
                    <Star size={26} strokeWidth={2.2} />
                  </div>
                  <div>
                    <div style={featureTitleStyle}>Build Reputation</div>
                    <div style={featureDescStyle}>
                      Collect reviews and showcase your work to attract more clients
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div style={rightPanelStyle} className="right-panel">
            <div style={formContainerStyle}>
              {/* Mobile Logo */}
              <div style={mobileLogoStyle} className="mobile-logo">
                <img src={logo.src} alt="ServEase" style={mobileLogoImgStyle} />
              </div>

              {/* Form Header */}
              <div style={formHeaderStyle}>
                <h2 style={formTitleStyle}>Provider Login</h2>
                <p style={formSubtitleStyle}>Welcome back! Please enter your details</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={formStyle}>
                {/* Error Message */}
                {error && (
                  <div style={errorStyle}>
                    {error}
                  </div>
                )}

                {/* Email Input */}
                <div style={inputGroupStyle}>
                  <label htmlFor="email" style={labelStyle}>
                    Email or Phone Number
                  </label>
                  <div style={inputWrapperStyle}>
                    <div style={inputIconStyle}>
                      <Mail size={20} />
                    </div>
                    <input
                      type="text"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email or phone"
                      style={inputStyle}
                      className="login-input"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div style={inputGroupStyle}>
                  <label htmlFor="password" style={labelStyle}>
                    Password
                  </label>
                  <div style={inputWrapperStyle}>
                    <div style={inputIconStyle}>
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      style={{
                        ...inputStyle,
                        paddingRight: '3.25rem',
                      }}
                      className="login-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={eyeButtonStyle}
                      className="eye-btn"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div style={rememberForgotStyle}>
                  <label style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={checkboxStyle}
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    style={forgotLinkStyle}
                    className="forgot-link"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    ...submitButtonStyle,
                    ...(isLoading ? submitButtonDisabledStyle : {}),
                  }}
                  className="submit-btn"
                >
                  {isLoading ? (
                    <>
                      <div style={spinnerStyle}></div>
                      Logging in...
                    </>
                  ) : (
                    <>
                      Log In
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div style={footerStyle}>
                <p>
                  New provider?{' '}
                  <button
                    onClick={() => navigate('/provider/apply')}
                    style={applyLinkStyle}
                    className="apply-link"
                  >
                    Apply now
                  </button>
                </p>
              </div>

              {/* Additional Links */}
              <div style={dividerStyle}>
                <div style={linksContainerStyle}>
                  <button style={linkButtonStyle} className="footer-link">
                    Terms of Service
                  </button>
                  <span>•</span>
                  <button style={linkButtonStyle} className="footer-link">
                    Privacy Policy
                  </button>
                  <span>•</span>
                  <button style={linkButtonStyle} className="footer-link">
                    Help Center
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
