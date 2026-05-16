export interface CustomerRegistrationInput {
  fullName: string;
  email: string;
  password: string;
  contactNumber?: string | null;
  address?: string | null;
}

export interface GatewayCustomerRegistrationRequest {
  role: 'customer';
  email: string;
  password: string;
  fullName: string;
  contactNumber: string | null;
  address: string | null;
}

interface ApiResponse<T> {
  data?: T;
  error?: {
    message?: string;
  };
}

export function buildGatewayCustomerRegistrationPayload(
  input: CustomerRegistrationInput,
): GatewayCustomerRegistrationRequest {
  return {
    role: 'customer',
    email: input.email.trim().toLowerCase(),
    password: input.password,
    fullName: input.fullName.trim(),
    contactNumber: normalizePhilippineContactNumber(input.contactNumber ?? ''),
    address: input.address?.trim() || null,
  };
}

export async function registerCustomer(
  input: CustomerRegistrationInput,
): Promise<unknown> {
  const response = await fetch('/api/customer-registration', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(input),
  }).catch(() => null);

  return readApiResponse(response, 'Registration failed. Please try again.');
}

export async function requestCustomerPasswordReset(
  email: string,
): Promise<unknown> {
  const response = await fetch('/api/password-reset', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ email }),
  }).catch(() => null);

  return readApiResponse(
    response,
    'Password reset request failed. Please try again.',
  );
}

function normalizePhilippineContactNumber(value: string): string | null {
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  if (digits.startsWith('63')) {
    return `+${digits}`;
  }

  if (digits.startsWith('0')) {
    return `+63${digits.slice(1)}`;
  }

  return `+63${digits}`;
}

async function readApiResponse<T>(
  response: Response | null,
  fallbackMessage: string,
): Promise<T | null> {
  if (!response) {
    throw new Error('Could not reach the authentication service.');
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? fallbackMessage);
  }

  return payload?.data ?? null;
}
