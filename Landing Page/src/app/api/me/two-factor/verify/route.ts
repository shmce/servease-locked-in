import { getServerGatewayBaseUrl } from '@/app/lib/gateway-base-url';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return proxyTwoFactor(request, '/v1/me/two-factor/verify');
}

async function proxyTwoFactor(request: Request, path: string) {
  const authorization = request.headers.get('authorization');
  if (!authorization) {
    return NextResponse.json(
      { error: { code: 'auth_required', message: 'Authentication is required.' } },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const gatewayBaseUrl =
    getServerGatewayBaseUrl();
  try {
    const response = await fetch(`${gatewayBaseUrl}${path}`, {
      method: 'POST',
      headers: {
        authorization,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const responseBody = await response.json().catch(() => null);
    if (!response.ok) {
      const gatewayError = responseBody as {
        error?: { code?: string; message?: string };
      } | null;
      return NextResponse.json(
        {
          error: {
            code: gatewayError?.error?.code ?? 'two_factor_verify_failed',
            message:
              gatewayError?.error?.message ??
              'Could not verify two-factor authentication.',
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
          code: 'two_factor_gateway_unavailable',
          message: 'Could not reach the two-factor authentication service.',
        },
      },
      { status: 503 },
    );
  }
}
