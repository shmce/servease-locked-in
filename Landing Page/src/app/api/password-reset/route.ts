import { NextResponse } from 'next/server';

const DEFAULT_GATEWAY_BASE_URL = 'http://localhost:5001';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        email?: string;
        redirectTo?: string | null;
      }
    | null;

  if (!body?.email?.trim() || !EMAIL_PATTERN.test(body.email.trim())) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_password_reset_request',
          message: 'A valid email is required.',
        },
      },
      { status: 400 },
    );
  }

  const gatewayBaseUrl =
    process.env.SERVEASE_API_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL;

  try {
    const response = await fetch(`${gatewayBaseUrl}/v1/auth/password-reset`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email.trim().toLowerCase(),
        redirectTo: body.redirectTo?.trim() || null,
      }),
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
            code: gatewayError?.error?.code ?? 'password_reset_failed',
            message:
              gatewayError?.error?.message ??
              'Password reset request failed. Please try again.',
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
          code: 'password_reset_gateway_unavailable',
          message: 'Could not reach the password reset service.',
        },
      },
      { status: 503 },
    );
  }
}
