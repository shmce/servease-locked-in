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
      'Refund processing depends on the payment provider. Current cash-on-service payments do not reserve a card charge.',
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
