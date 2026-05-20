import { useState } from 'react';

export type LoginMethod = 'email' | 'google' | 'phone';

export function useAuthViewModel({
  requestPhoneOtp,
  verifyPhoneOtp,
  setNotice,
}: {
  requestPhoneOtp: (target: string) => Promise<string | null>;
  verifyPhoneOtp: (otpId: string, code: string) => Promise<boolean>;
  setNotice: (notice: string) => void;
}) {
  const [isAgreed, setIsAgreed] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [phoneLoginTarget, setPhoneLoginTarget] = useState('');
  const [phoneOtpId, setPhoneOtpId] = useState<string | null>(null);
  const [phoneOtpCode, setPhoneOtpCode] = useState('');

  function updatePhoneLoginTarget(value: string) {
    setPhoneLoginTarget(value);
    setPhoneOtpId(null);
    setPhoneOtpCode('');
  }

  async function sendPhoneOtp() {
    if (!phoneLoginTarget.trim()) {
      setNotice('Enter your phone number first.');
      return;
    }

    const otpId = await requestPhoneOtp(phoneLoginTarget);
    if (otpId) {
      setPhoneOtpId(otpId);
    }
  }

  async function verifyPhoneOtpCode() {
    if (!phoneOtpId) {
      return;
    }

    const isValid = await verifyPhoneOtp(phoneOtpId, phoneOtpCode);
    if (isValid) {
      setPhoneOtpCode('');
    }
  }

  return {
    data: {
      isAgreed,
      loginMethod,
      phoneLoginTarget,
      phoneOtpId,
      phoneOtpCode,
    },
    isLoading: false,
    error: null,
    actions: {
      setIsAgreed,
      setLoginMethod,
      setPhoneOtpCode,
      updatePhoneLoginTarget,
      sendPhoneOtp,
      verifyPhoneOtpCode,
    },
  };
}
