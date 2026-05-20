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

  const gatewayBaseUrl =
    getServerGatewayBaseUrl();

  try {
    const response = await fetch(
      `${gatewayBaseUrl}/v1/auth/provider-application/me`,
      {
        method: 'GET',
        headers: {
          authorization,
          accept: 'application/json',
        },
        cache: 'no-store',
      },
    );

    const responseBody = (await response.json().catch(() => null)) as
      | GatewayErrorResponse
      | unknown;

    if (!response.ok) {
      const gatewayError = responseBody as GatewayErrorResponse | null;
      return NextResponse.json(
        {
          error: {
            code:
              gatewayError?.error?.code ??
              'provider_application_status_failed',
            message:
              gatewayError?.error?.message ??
              'Could not load provider application status.',
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
          code: 'provider_application_gateway_unavailable',
          message: 'Could not reach the provider application service.',
        },
      },
      { status: 503 },
    );
  }
}
