import { getServerGatewayBaseUrl } from '@/app/lib/gateway-base-url';
import { NextResponse } from 'next/server';

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ methodId: string }> },
) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const { methodId } = await params;

  if (!methodId) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_payment_method_request',
          message: 'Payment method id is required.',
        },
      },
      { status: 400 },
    );
  }

  const gatewayBaseUrl =
    getServerGatewayBaseUrl();

  try {
    const response = await fetch(
      `${gatewayBaseUrl}/v1/payments/methods/${encodeURIComponent(methodId)}`,
      {
        method: 'DELETE',
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
            code: gatewayError?.error?.code ?? 'payment_method_delete_failed',
            message:
              gatewayError?.error?.message ??
              'Could not delete this payment method.',
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
          code: 'payment_gateway_unavailable',
          message: 'Could not reach the payment service.',
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
