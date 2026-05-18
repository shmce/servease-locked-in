import { getServerGatewayBaseUrl } from '@/app/lib/gateway-base-url';
import { NextResponse } from 'next/server';

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const gatewayBaseUrl =
    getServerGatewayBaseUrl();

  try {
    const response = await fetch(`${gatewayBaseUrl}/v1/referrals`, {
      method: 'GET',
      headers: {
        authorization,
        accept: 'application/json',
      },
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
            code: gatewayError?.error?.code ?? 'referral_lookup_failed',
            message:
              gatewayError?.error?.message ??
              'Could not load your referral summary.',
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
          code: 'referral_gateway_unavailable',
          message: 'Could not reach the referral service.',
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
