import { useMemo } from 'react';

const termsSections = [
  {
    title: 'Terms of Service',
    body: 'ServEase connects customers with independent service providers. Bookings, payments, cancellations, support, and reviews are handled through the platform features available in this app.',
  },
  {
    title: 'Privacy Policy',
    body: 'Personal information is used to operate marketplace accounts, bookings, support, notifications, and provider/customer communication.',
  },
];

export function useCustomerTermsViewModel() {
  return useMemo(
    () => ({
      data: {
        termsSections,
      },
      isLoading: false,
      error: null,
    }),
    [],
  );
}
