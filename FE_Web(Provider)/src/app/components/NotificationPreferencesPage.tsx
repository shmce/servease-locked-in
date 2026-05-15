import { useState } from 'react';
import { Bell, DollarSign, Settings, Clock, CheckCircle } from 'lucide-react';

// Styles object for reusability
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #F9FAFB, rgba(16, 185, 129, 0.05))',
    padding: '32px',
  },
  maxWidthContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  pageHeader: {
    marginBottom: '32px',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '12px',
    letterSpacing: '-0.025em',
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#6B7280',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #F3F4F6',
    padding: '24px',
    marginBottom: '24px',
    transition: 'box-shadow 0.3s ease',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #F3F4F6',
  },
  sectionTitleText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111827',
  },
  iconContainer: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid #F9FAFB',
  },
  settingLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  settingDescription: {
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '4px',
  },
  toggle: {
    position: 'relative' as const,
    width: '48px',
    height: '24px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    border: 'none',
    padding: 0,
  },
  toggleThumb: {
    position: 'absolute' as const,
    top: '2px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'white',
    transition: 'transform 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  timeInput: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid #E5E7EB',
    fontSize: '14px',
    color: '#374151',
    outline: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    width: '200px',
  },
  button: {
    padding: '14px 32px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#00BF63',
    color: 'white',
    boxShadow: '0 4px 16px rgba(0, 191, 99, 0.25)',
  },
  successMessage: {
    position: 'fixed' as const,
    top: '24px',
    right: '24px',
    backgroundColor: '#00BF63',
    color: 'white',
    padding: '16px 24px',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 191, 99, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: 1000,
    animation: 'slideIn 0.3s ease',
  },
};

interface NotificationSettings {
  // Booking Notifications
  newBookingRequests: boolean;
  bookingConfirmations: boolean;
  bookingCancellations: boolean;
  bookingModifications: boolean;
  customerMessages: boolean;
  // Payment Notifications
  paymentReceived: boolean;
  payoutProcessed: boolean;
  // General Notifications
  promotionalOffers: boolean;
  platformUpdates: boolean;
  dailySummary: boolean;
  // Notification Timing
  preferredTime: string;
}

export function NotificationPreferencesPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    newBookingRequests: true,
    bookingConfirmations: true,
    bookingCancellations: true,
    bookingModifications: true,
    customerMessages: true,
    paymentReceived: true,
    payoutProcessed: true,
    promotionalOffers: false,
    platformUpdates: true,
    dailySummary: false,
    preferredTime: '09:00',
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const toggleSetting = (key: keyof NotificationSettings) => {
    if (key === 'preferredTime') return; // Don't toggle time input
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTimeChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      preferredTime: value,
    }));
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log('Saving notification preferences:', settings);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      style={{
        ...styles.toggle,
        backgroundColor: checked ? '#00BF63' : '#E5E7EB',
      }}
      aria-label="Toggle setting"
    >
      <div
        style={{
          ...styles.toggleThumb,
          transform: checked ? 'translateX(24px)' : 'translateX(0)',
        }}
      />
    </button>
  );

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Notification Preferences</h1>
          <p style={styles.pageSubtitle}>Manage how you receive updates and alerts from the platform</p>
        </div>

        {/* Section 1 - Booking Notifications */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>
            <div style={{ ...styles.iconContainer, backgroundColor: '#DBEAFE' }}>
              <Bell style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
            </div>
            <h2 style={styles.sectionTitleText}>Booking Notifications</h2>
          </div>

          <div>
            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>New booking requests</div>
                <div style={styles.settingDescription}>Get notified when customers request your services</div>
              </div>
              <ToggleSwitch
                checked={settings.newBookingRequests}
                onChange={() => toggleSetting('newBookingRequests')}
              />
            </div>

            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Booking confirmations</div>
                <div style={styles.settingDescription}>Receive alerts when bookings are confirmed</div>
              </div>
              <ToggleSwitch
                checked={settings.bookingConfirmations}
                onChange={() => toggleSetting('bookingConfirmations')}
              />
            </div>

            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Booking cancellations</div>
                <div style={styles.settingDescription}>Stay informed about cancelled bookings</div>
              </div>
              <ToggleSwitch
                checked={settings.bookingCancellations}
                onChange={() => toggleSetting('bookingCancellations')}
              />
            </div>

            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Booking modifications</div>
                <div style={styles.settingDescription}>Know when customers change booking details</div>
              </div>
              <ToggleSwitch
                checked={settings.bookingModifications}
                onChange={() => toggleSetting('bookingModifications')}
              />
            </div>

            <div style={{ ...styles.settingRow, borderBottom: 'none' }}>
              <div>
                <div style={styles.settingLabel}>Customer messages</div>
                <div style={styles.settingDescription}>Get notified of new messages from customers</div>
              </div>
              <ToggleSwitch
                checked={settings.customerMessages}
                onChange={() => toggleSetting('customerMessages')}
              />
            </div>
          </div>
        </div>

        {/* Section 2 - Payment Notifications */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>
            <div style={{ ...styles.iconContainer, backgroundColor: '#D1FAE5' }}>
              <DollarSign style={{ width: '20px', height: '20px', color: '#00BF63' }} />
            </div>
            <h2 style={styles.sectionTitleText}>Payment Notifications</h2>
          </div>

          <div>
            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Payment received</div>
                <div style={styles.settingDescription}>Receive alerts when customers complete payment</div>
              </div>
              <ToggleSwitch
                checked={settings.paymentReceived}
                onChange={() => toggleSetting('paymentReceived')}
              />
            </div>

            <div style={{ ...styles.settingRow, borderBottom: 'none' }}>
              <div>
                <div style={styles.settingLabel}>Payout processed</div>
                <div style={styles.settingDescription}>Get notified when your payout is completed</div>
              </div>
              <ToggleSwitch
                checked={settings.payoutProcessed}
                onChange={() => toggleSetting('payoutProcessed')}
              />
            </div>
          </div>
        </div>

        {/* Section 3 - General Notifications */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>
            <div style={{ ...styles.iconContainer, backgroundColor: '#F3E8FF' }}>
              <Settings style={{ width: '20px', height: '20px', color: '#9333EA' }} />
            </div>
            <h2 style={styles.sectionTitleText}>General Notifications</h2>
          </div>

          <div>
            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Promotional offers</div>
                <div style={styles.settingDescription}>Receive updates about special promotions and offers</div>
              </div>
              <ToggleSwitch
                checked={settings.promotionalOffers}
                onChange={() => toggleSetting('promotionalOffers')}
              />
            </div>

            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Platform updates</div>
                <div style={styles.settingDescription}>Stay informed about new features and improvements</div>
              </div>
              <ToggleSwitch
                checked={settings.platformUpdates}
                onChange={() => toggleSetting('platformUpdates')}
              />
            </div>

            <div style={{ ...styles.settingRow, borderBottom: 'none' }}>
              <div>
                <div style={styles.settingLabel}>Daily summary</div>
                <div style={styles.settingDescription}>Get a daily summary of your activity and bookings</div>
              </div>
              <ToggleSwitch
                checked={settings.dailySummary}
                onChange={() => toggleSetting('dailySummary')}
              />
            </div>
          </div>
        </div>

        {/* Section 4 - Notification Timing */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>
            <div style={{ ...styles.iconContainer, backgroundColor: '#FEF3C7' }}>
              <Clock style={{ width: '20px', height: '20px', color: '#F59E0B' }} />
            </div>
            <h2 style={styles.sectionTitleText}>Notification Timing</h2>
          </div>

          <div>
            <div style={{ ...styles.settingRow, borderBottom: 'none' }}>
              <div>
                <div style={styles.settingLabel}>Preferred notification time</div>
                <div style={styles.settingDescription}>Set your preferred time for daily summary notifications</div>
              </div>
              <input
                type="time"
                value={settings.preferredTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                style={styles.timeInput}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#00BF63';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 191, 99, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', marginBottom: '32px' }}>
          <button
            onClick={handleSave}
            style={styles.button}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 191, 99, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#00BF63';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 191, 99, 0.25)';
            }}
          >
            <CheckCircle style={{ width: '18px', height: '18px' }} />
            <span>Save Preferences</span>
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div style={styles.successMessage}>
            <CheckCircle style={{ width: '20px', height: '20px' }} />
            <span>Notification preferences saved successfully!</span>
          </div>
        )}
      </div>

      {/* Add animation keyframes */}
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}
