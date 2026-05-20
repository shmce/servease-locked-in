import { useMemo } from 'react';

export function useProviderSecurityViewModel() {
  const data = useMemo(
    () => ({
      pageTitle: 'Security',
      pageSubtitle: 'Protect your provider account',
      sectionTitle: 'Two-factor authentication',
    }),
    [],
  );

  return {
    data,
    isLoading: false,
    error: null,
  };
}
