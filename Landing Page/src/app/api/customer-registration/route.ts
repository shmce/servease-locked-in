import { NextResponse } from 'next/server';
import {
  buildGatewayCustomerRegistrationPayload,
  CustomerRegistrationInput,
  GatewayCustomerRegistrationRequest,
} from '../../lib/customer-auth';

const DEFAULT_GATEWAY_BASE_URL = 'http://localhost:5001';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

export async function POST(request: Request) {
  let payload: GatewayCustomerRegistrationRequest;

  try {
    const input = (await request.json()) as CustomerRegistrationInput;
    assertCustomerRegistrationInput(input);
    payload = buildGatewayCustomerRegistrationPayload(input);
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_customer_registration_request',
          message:
            error instanceof Error
              ? error.message
              : 'Customer registration data is invalid.',
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

function assertCustomerRegistrationInput(
  value: unknown,
): asserts value is CustomerRegistrationInput {
  if (!isObject(value)) {
    throw new Error('Registration data is invalid.');
  }

  if (
    !isNonEmptyString(value.fullName) ||
    !isNonEmptyString(value.email) ||
    !EMAIL_PATTERN.test(value.email.trim()) ||
    !isNonEmptyString(value.password) ||
    value.password.length < 8
  ) {
    throw new Error('Name, valid email, and an 8-character password are required.');
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
