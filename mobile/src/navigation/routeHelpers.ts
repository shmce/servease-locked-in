import {
  Briefcase,
  Car,
  Flower2,
  PawPrint,
  PartyPopper,
  Sparkles,
  Wrench,
} from 'lucide-react-native';
import { BookingStatus } from '../shared/models/types';
import { palette } from '../theme/serveaseDesign';
import { AppScreen, CustomerTab, ProviderTab } from './types';

export function getCustomerTab(screen: AppScreen): CustomerTab {
  if (
    screen === 'bookings' ||
    screen === 'customerBookingReview' ||
    screen === 'customerReservePayment' ||
    screen === 'customerBookingConfirmation' ||
    screen === 'customerBookingDetail' ||
    screen === 'customerBookingManage' ||
    screen === 'customerBookingCancel' ||
    screen === 'customerBookingReport' ||
    screen === 'customerTrackServiceProvider'
  ) {
    return 'bookings';
  }
  if (screen === 'calendar') {
    return 'calendar';
  }
  if (screen === 'messages') {
    return 'messages';
  }
  if (
    screen === 'more' ||
    screen === 'customerAddresses' ||
    screen === 'customerPaymentMethods' ||
    screen === 'customerProfile' ||
    screen === 'customerSettings' ||
    screen === 'customerHelp' ||
    screen === 'customerServiceHistory' ||
    screen === 'customerNotifications' ||
    screen === 'customerReferral'
  ) {
    return 'more';
  }
  return 'explore';
}

export function getProviderTab(screen: AppScreen): ProviderTab {
  if (
    screen === 'bookings' ||
    screen === 'providerBookingDetail' ||
    screen === 'providerNavigationMode' ||
    screen === 'providerStartService' ||
    screen === 'providerServiceInProgress' ||
    screen === 'providerCompleteService' ||
    screen === 'providerServiceCompleted' ||
    screen === 'providerCancelBooking' ||
    screen === 'providerReportIssue' ||
    screen === 'providerServiceReceipt'
  ) {
    return 'bookings';
  }
  if (screen === 'calendar' || screen === 'providerSetAvailability') {
    return 'calendar';
  }
  if (screen === 'messages') {
    return 'messages';
  }
  if (
    screen === 'more' ||
    screen === 'providerProfileView' ||
    screen === 'providerEditProfile' ||
    screen === 'providerPortfolio' ||
    screen === 'providerPayoutManagement' ||
    screen === 'providerRequestPayout' ||
    screen === 'providerReviews' ||
    screen === 'providerEarnings' ||
    screen === 'providerNotifications' ||
    screen === 'providerInsights' ||
    screen === 'providerHelp' ||
    screen === 'providerServices' ||
    screen === 'providerSecurity' ||
    screen === 'providerSettings'
  ) {
    return 'more';
  }
  return 'home';
}

export function timelineForStatus(status: BookingStatus) {
  return [
    { label: 'Booked', completed: true },
    {
      label: 'On the way',
      completed: ['confirmed', 'in_progress', 'completed'].includes(status),
    },
    {
      label: 'Started',
      completed: ['in_progress', 'completed'].includes(status),
    },
    { label: 'Completed', completed: status === 'completed' },
  ];
}

export function categoryIconFor(title: string): typeof Wrench {
  const value = title.toLowerCase();
  if (value.includes('beauty') || value.includes('wellness')) {
    return Flower2;
  }
  if (value.includes('education') || value.includes('professional')) {
    return Briefcase;
  }
  if (value.includes('clean')) {
    return Sparkles;
  }
  if (value.includes('pet')) {
    return PawPrint;
  }
  if (value.includes('event') || value.includes('entertainment')) {
    return PartyPopper;
  }
  if (value.includes('auto') || value.includes('tech')) {
    return Car;
  }
  return Wrench;
}

export function categoryColorFor(title: string) {
  const value = title.toLowerCase();
  if (value.includes('beauty') || value.includes('wellness')) {
    return { color: '#E879A8', bg: '#FEF0F7' };
  }
  if (value.includes('education') || value.includes('professional')) {
    return { color: palette.violet, bg: '#F0F1FE' };
  }
  if (value.includes('clean')) {
    return { color: palette.blue, bg: '#EFF7FE' };
  }
  if (value.includes('pet')) {
    return { color: palette.amber, bg: '#FEF5E8' };
  }
  if (value.includes('event') || value.includes('entertainment')) {
    return { color: palette.coral, bg: '#FFF0EE' };
  }
  if (value.includes('auto') || value.includes('tech')) {
    return { color: '#9B7FE8', bg: '#F4F0FE' };
  }
  return { color: palette.mint, bg: palette.mintSoft };
}

export function readError(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected mobile error.';
}
