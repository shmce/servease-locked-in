import { useMemo } from 'react';

export function useProviderSecurityViewModel() {
  const data = useMemo(
    () => ({
      pageTitle: 'Security',
      pageSubtitle: 'Protect your provider account',
      sectionTitle: 'Account protection',
    }),
    [],
  );

  return {
    data,
    isLoading: false,
    error: null,
  };
}
