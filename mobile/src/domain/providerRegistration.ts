export type ProviderSignupRequirementsInput = {
  businessName: string;
  contactNumber: string;
  experienceYears: string;
  serviceArea: string;
  serviceDescription: string;
};

export const providerSignupRequirements = [
  'Business name',
  'Contact number',
  'Service area',
  'Service description',
  'Years of experience',
  'Government ID upload after account creation',
] as const;

export function validateProviderSignupRequirements({
  businessName,
  contactNumber,
  experienceYears,
  serviceArea,
  serviceDescription,
}: ProviderSignupRequirementsInput): string | null {
  if (!contactNumber.trim()) {
    return 'Enter a contact number for your provider application.';
  }

  if (!businessName.trim()) {
    return 'Enter your business name.';
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
