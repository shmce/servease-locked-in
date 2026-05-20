import { getServerGatewayBaseUrl } from '@/app/lib/gateway-base-url';
import { NextResponse } from 'next/server';

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

interface PasswordUpdatePayload {
  currentPassword?: string;
  newPassword?: string;
}

export async function PATCH(request: Request) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const body = (await request.json().catch(() => null)) as
    | PasswordUpdatePayload
    | null;

  if (
    !body?.currentPassword ||
    !body.newPassword ||
    body.newPassword.length < 8 ||
    body.currentPassword === body.newPassword
  ) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_password_change_request',
          message:
            'Current password and a different 8-character new password are required.',
        },
      },
      { status: 400 },
    );
  }

  const gatewayBaseUrl =
    getServerGatewayBaseUrl();

  try {
    const response = await fetch(`${gatewayBaseUrl}/v1/me/password`, {
      method: 'PATCH',
      headers: {
        authorization,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
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
            code: gatewayError?.error?.code ?? 'password_change_failed',
            message:
              gatewayError?.error?.message ??
              'Could not update your password.',
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
          code: 'password_change_gateway_unavailable',
          message: 'Could not reach the password service.',
        },
      },
      { status: 503 },
    );
  }
}

function authRequired() {
  return NextResponse.json(
    {
      error: {
        code: 'auth_required',
        message: 'Authentication is required.',
      },
    },
    { status: 401 },
  );
}
