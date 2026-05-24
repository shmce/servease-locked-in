import { useState } from 'react';

export type LoginMethod = 'email' | 'google';

export function useAuthViewModel() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');

  return {
    data: {
      loginMethod,
    },
    isLoading: false,
    error: null,
    actions: {
      setLoginMethod,
    },
  };
}
