import { getServerGatewayBaseUrl } from '@/app/lib/gateway-base-url';
import { NextResponse } from 'next/server';
import {
  GatewayProviderRegistrationRequest,
  buildGatewayProviderRegistrationPayload,
  ProviderRegistrationDraft,
} from '../../lib/provider-registration';

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export async function POST(request: Request) {
  let payload: GatewayProviderRegistrationRequest;

  try {
    const draft = await request.json();
    assertProviderRegistrationDraft(draft);
    payload = buildGatewayProviderRegistrationPayload(draft);
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_registration_draft',
          message:
            error instanceof Error
              ? error.message
              : 'Registration data is invalid.',
        },
      },
      { status: 400 },
    );
  }

  const gatewayBaseUrl =
    getServerGatewayBaseUrl();

  try {
    const response = await fetch(`${gatewayBaseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const responseBody = (await response.json().catch(() => null)) as
      | GatewayErrorResponse
      | unknown;

    if (!response.ok) {
      const gatewayError = responseBody as GatewayErrorResponse | null;
      return NextResponse.json(
        {
          error: {
            code: gatewayError?.error?.code ?? 'registration_failed',
            message:
              gatewayError?.error?.message ??
              'Registration failed. Please try again.',
          },
        },
        { status: response.status },
      );
    }

    return NextResponse.json(responseBody, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'registration_gateway_unavailable',
          message:
            'Could not reach the registration service. Make sure the backend is running.',
        },
      },
      { status: 503 },
    );
  }
}

function assertProviderRegistrationDraft(
  value: unknown,
): asserts value is ProviderRegistrationDraft {
  if (!isObject(value)) {
    throw new Error('Please complete all registration steps before submitting.');
  }

  const { step1, step2, step3, step4 } = value;

  if (
    !isObject(step1) ||
    !isObject(step2) ||
    !isObject(step3) ||
    !isObject(step4) ||
    !isNonEmptyString(step1.fullName) ||
    !isNonEmptyString(step1.email) ||
    !isAdultBirthdate(step1.birthdate) ||
    !isNonEmptyString(step1.password) ||
    !isNonEmptyString(step1.contactNumber) ||
    !isNonEmptyString(step2.businessName) ||
    !isNonEmptyString(step2.primaryCategory) ||
    !isNonEmptyString(step2.subCategory) ||
    !isNonEmptyString(step2.experienceYears) ||
    !isNonEmptyString(step3.streetAddress) ||
    !isNonEmptyString(step3.city) ||
    !isNonEmptyString(step3.province) ||
    !isNonEmptyString(step3.zipCode) ||
    typeof step3.maxServiceRadius !== 'number' ||
    !isNonEmptyString(step4.idType) ||
    !isNonEmptyString(step4.fileName)
  ) {
    throw new Error('Please complete all registration steps before submitting.');
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isAdultBirthdate(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const birthdate = parseDateParts(value.trim());
  const today = parseDateParts(formatLocalDate(new Date()));
  if (!birthdate || !today || compareDateParts(birthdate, today) > 0) {
    return false;
  }

  const age =
    today.year -
    birthdate.year -
    (today.month < birthdate.month ||
    (today.month === birthdate.month && today.day < birthdate.day)
      ? 1
      : 0);

  return age >= 18;
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
