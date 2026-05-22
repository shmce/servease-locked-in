export type ProviderSignupRequirementsInput = {
  businessName: string;
  birthdate: string;
  contactNumber: string;
  experienceYears: string;
  serviceId?: string | null;
  serviceArea: string;
  serviceDescription: string;
};

export type ProviderSignupValidationOptions = {
  today?: string;
};

export const providerSignupRequirements = [
  'Business name',
  'Birthdate',
  'Contact number',
  'Service area',
  'Service description',
  'Years of experience',
  'Government ID upload after account creation',
] as const;

export function validateProviderSignupRequirements(
  {
    businessName,
    birthdate,
    contactNumber,
    experienceYears,
    serviceId,
    serviceArea,
    serviceDescription,
  }: ProviderSignupRequirementsInput,
  options: ProviderSignupValidationOptions = {},
): string | null {
  if (!contactNumber.trim()) {
    return 'Enter a contact number for your provider application.';
  }

  const birthdateStatus = validateProviderBirthdate(birthdate, options.today);
  if (birthdateStatus === 'missing') {
    return 'Enter your birthdate.';
  }
  if (birthdateStatus === 'invalid') {
    return 'Enter your birthdate in YYYY-MM-DD format.';
  }
  if (birthdateStatus === 'underage') {
    return 'Providers must be at least 18 years old to sign up.';
  }

  if (!businessName.trim()) {
    return 'Enter your business name.';
  }

  if (!serviceId?.trim()) {
    return 'Choose a catalog service for your provider application.';
  }

  if (!serviceArea.trim()) {
    return 'Enter the city or area where you provide services.';
  }

  if (!serviceDescription.trim()) {
    return 'Describe the service you will offer.';
  }

  const normalizedExperience = normalizeProviderExperienceYears(experienceYears);
  if (!normalizedExperience) {
    return 'Enter your years of experience.';
  }

  return null;
}

export function buildProviderServiceDescription(
  serviceDescription: string,
  experienceYears: string,
): string {
  const description = serviceDescription.trim();
  const normalizedExperience = normalizeProviderExperienceYears(experienceYears);

  if (!normalizedExperience) {
    return description;
  }

  const suffix =
    normalizedExperience === '1'
      ? '1 year experience'
      : `${normalizedExperience} years experience`;

  return [description, suffix].filter(Boolean).join(' - ');
}

function normalizeProviderExperienceYears(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const years = Number(trimmed);
  if (!Number.isFinite(years) || years < 0) {
    return null;
  }

  return Number.isInteger(years) ? String(years) : years.toFixed(1);
}

function validateProviderBirthdate(
  birthdate: string,
  today = formatLocalDate(new Date()),
): 'valid' | 'missing' | 'invalid' | 'underage' {
  const trimmed = birthdate.trim();
  if (!trimmed) {
    return 'missing';
  }

  const birthParts = parseDateParts(trimmed);
  const todayParts = parseDateParts(today);
  if (!birthParts || !todayParts || compareDateParts(birthParts, todayParts) > 0) {
    return 'invalid';
  }

  const age =
    todayParts.year -
    birthParts.year -
    (todayParts.month < birthParts.month ||
    (todayParts.month === birthParts.month && todayParts.day < birthParts.day)
      ? 1
      : 0);

  return age >= 18 ? 'valid' : 'underage';
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateParts(
  value: string,
): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function compareDateParts(
  left: { year: number; month: number; day: number },
  right: { year: number; month: number; day: number },
): number {
  if (left.year !== right.year) {
    return left.year - right.year;
  }
  if (left.month !== right.month) {
    return left.month - right.month;
  }
  return left.day - right.day;
}
