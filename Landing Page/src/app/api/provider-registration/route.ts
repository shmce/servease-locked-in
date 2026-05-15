import { NextResponse } from 'next/server';
import {
  GatewayProviderRegistrationRequest,
  buildGatewayProviderRegistrationPayload,
  ProviderRegistrationDraft,
} from '../../lib/provider-registration';

const DEFAULT_GATEWAY_BASE_URL = 'http://localhost:5001';

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
    process.env.SERVEASE_API_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL;

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
    !isNonEmptyString(step1.password) ||
    !isNonEmptyString(step2.primaryCategory) ||
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
