export const providerRegistrationStorageKeys = [
  'providerRegStep1',
  'providerRegStep2',
  'providerRegStep3',
  'providerRegStep4',
] as const;

export interface ProviderRegistrationStep1 {
  fullName: string;
  email: string;
  contactNumber: string;
  password: string;
  confirmPassword?: string;
}

export interface ProviderRegistrationStep2 {
  primaryCategory: string;
  subCategory: string;
  experienceYears: string;
}

export interface ProviderRegistrationStep3 {
  streetAddress: string;
  city: string;
  province: string;
  zipCode: string;
  maxServiceRadius: number;
}

export interface ProviderRegistrationStep4 {
  idType: string;
  fileName: string;
}

export interface ProviderRegistrationDraft {
  step1: ProviderRegistrationStep1;
  step2: ProviderRegistrationStep2;
  step3: ProviderRegistrationStep3;
  step4: ProviderRegistrationStep4;
}

export interface GatewayProviderRegistrationRequest {
  role: 'provider';
  email: string;
  password: string;
  fullName: string;
  contactNumber: string | null;
  businessName: string;
  serviceDescription: string;
  serviceArea: string;
}

export function buildGatewayProviderRegistrationPayload(
  draft: ProviderRegistrationDraft,
): GatewayProviderRegistrationRequest {
  const serviceParts = [
    draft.step2.primaryCategory,
    draft.step2.subCategory,
    draft.step2.experienceYears,
  ].filter(Boolean);

  const areaParts = [
    draft.step3.streetAddress,
    draft.step3.city,
    draft.step3.province,
    draft.step3.zipCode,
    `${draft.step3.maxServiceRadius}km radius`,
  ].filter(Boolean);

  return {
    role: 'provider',
    email: draft.step1.email.trim(),
    password: draft.step1.password,
    fullName: draft.step1.fullName.trim(),
    contactNumber: normalizePhilippineContactNumber(draft.step1.contactNumber),
    businessName: draft.step1.fullName.trim(),
    serviceDescription: serviceParts.join(' - '),
    serviceArea: areaParts.join(', '),
  };
}

export function clearProviderRegistrationDraft(): void {
  providerRegistrationStorageKeys.forEach((key) => sessionStorage.removeItem(key));
}

export function readProviderRegistrationDraft(): ProviderRegistrationDraft {
  return {
    step1: readStorageJson<ProviderRegistrationStep1>('providerRegStep1'),
    step2: readStorageJson<ProviderRegistrationStep2>('providerRegStep2'),
    step3: readStorageJson<ProviderRegistrationStep3>('providerRegStep3'),
    step4: readStorageJson<ProviderRegistrationStep4>('providerRegStep4'),
  };
}

function normalizePhilippineContactNumber(value: string): string | null {
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  if (digits.startsWith('63')) {
    return `+${digits}`;
  }

  return `+63${digits}`;
}

function readStorageJson<T>(key: string): T {
  const raw = sessionStorage.getItem(key);
  if (!raw) {
    throw new Error('Please complete all registration steps before submitting.');
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error('Saved registration data is invalid. Please restart the form.');
  }
}
