import { AppScreen } from '../navigation/types';
import { DayOfWeek } from '../../services/serveaseApi';

function createDefaultScheduledAt(): string {
  const date = new Date(Date.now() + 3 * 86400000);
  date.setHours(10, 0, 0, 0);

  if (date.getDay() === 0) {
    date.setDate(date.getDate() + 1);
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}T10:00`;
}

export const defaultScheduledAt = createDefaultScheduledAt();

export const dayLabels: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const dayOrder = Object.keys(dayLabels) as DayOfWeek[];

export const hiddenProviderBottomNavScreens: AppScreen[] = [
  'providerBookingDetail',
  'providerNavigationMode',
  'providerStartService',
  'providerServiceInProgress',
  'providerCompleteService',
  'providerServiceCompleted',
  'providerCancelBooking',
  'providerReportIssue',
  'providerServiceReceipt',
  'providerRequestPayout',
];

export const providerProfileTabs = [
  'About',
  'Services',
  'Portfolio',
  'Reviews',
  'Availability',
] as const;

export const bookingTimeSlots = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
];

export const customerCancelReasons = [
  'Found another service',
  'Changed my mind',
  'Schedule conflict',
  'Too expensive',
  'Service provider not responding',
  'Other',
];

export const customerIssueTypes = [
  'Service not completed',
  'Poor quality of work',
  'Damage to property',
  'Safety concern',
  'Service provider misconduct',
  'Overcharge',
  'Other',
];

export const customerResolutionOptions = [
  'Full refund',
  'Partial refund',
  'Service redo',
  'Apology',
  'Provider warning',
];

export const customerHelpFaqs = [
  {
    id: 1,
    category: 'Managing Bookings',
    question: 'How do I cancel my booking?',
    answer: 'Open Bookings, select the booking, tap Manage booking, then choose Cancel Booking.',
  },
  {
    id: 2,
    category: 'Payments & Refunds',
    question: 'When do I get my refund?',
    answer:
      'Refund processing depends on the payment provider. Cash-on-service bookings do not reserve a card charge.',
  },
  {
    id: 3,
    category: 'Safety & Trust',
    question: 'How does provider verification work?',
    answer: 'Verified providers show an approved status after completing platform verification.',
  },
];

export const customerHelpCategories = [
  'all',
  'Payments & Refunds',
  'Managing Bookings',
  'Safety & Trust',
  'Account',
];

export const providerBookingTabs = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'inProgress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
] as const;

export type ProviderBookingTab = (typeof providerBookingTabs)[number]['key'];

export const providerCancelReasons = [
  'Customer requested cancellation',
  'Cannot reach customer',
  'Schedule conflict',
  'Unsafe or incomplete service details',
];

export const providerHelpFaqs = [
  {
    id: 101,
    category: 'Bookings',
    question: 'How do I accept or decline a booking request?',
    answer:
      'Open Bookings, tap the pending booking, then choose Confirm Booking or Decline Request from the Booking Details screen.',
  },
  {
    id: 102,
    category: 'Bookings',
    question: 'What happens if I cancel a confirmed booking?',
    answer:
      'Customers are notified and refunded automatically. Frequent cancellations lower your acceptance rate visible on Insights.',
  },
  {
    id: 103,
    category: 'Payouts',
    question: 'When do payouts arrive?',
    answer:
      'Once you request a payout the platform queues it for the next payout cycle. Status shows on the Payouts screen.',
  },
  {
    id: 104,
    category: 'Payouts',
    question: 'Why is my available balance lower than my total earnings?',
    answer:
      'Earnings move to available after the customer marks the booking completed and the holding period passes.',
  },
  {
    id: 105,
    category: 'Profile and Services',
    question: 'How do I update my service pricing?',
    answer:
      'Open More → My Services, tap Edit on a service to change title or price, or Pause to temporarily hide it from customers.',
  },
  {
    id: 106,
    category: 'Profile and Services',
    question: 'How do I add work samples?',
    answer:
      'Open More → Portfolio. Tap Upload portfolio media to add photos, then tap Edit on each item to add a caption.',
  },
  {
    id: 107,
    category: 'Account',
    question: 'How do I set my weekly availability?',
    answer:
      'Open Calendar from the bottom tab bar. Pick a day, set start and end times, and save. Add days off for specific dates.',
  },
  {
    id: 108,
    category: 'Account',
    question: 'How do I enable two-factor authentication?',
    answer:
      'More → Security → Start Setup. Scan the QR or enter the secret in an authenticator app, then verify the 6-digit code.',
  },
];

export const providerHelpCategories = [
  'all',
  'Bookings',
  'Payouts',
  'Profile and Services',
  'Account',
];
