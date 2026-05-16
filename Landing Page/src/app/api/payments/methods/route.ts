import { NextResponse } from 'next/server';
import type { UpsertCustomerPaymentMethodInput } from '../../../lib/payments';

const DEFAULT_GATEWAY_BASE_URL = 'http://localhost:5001';

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

  return proxyGateway({
    authorization,
    method: 'GET',
  });
}

export async function PUT(request: Request) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const body = (await request.json().catch(() => null)) as
    | UpsertCustomerPaymentMethodInput
    | null;

  if (!body?.label?.trim() || !body.methodType) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_payment_method_request',
          message: 'Payment method type and label are required.',
        },
      },
      { status: 400 },
    );
  }

  return proxyGateway({
    authorization,
    method: 'PUT',
    body: {
      methodId: body.methodId ?? null,
      methodType: body.methodType,
      label: body.label.trim(),
      brand: body.brand?.trim() || null,
      last4: body.last4?.trim() || null,
      isDefault: body.isDefault ?? null,
    },
  });
}

async function proxyGateway(options: {
  authorization: string;
  method: 'GET' | 'PUT';
  body?: unknown;
}) {
  const gatewayBaseUrl =
    process.env.SERVEASE_API_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL;

  try {
    const response = await fetch(`${gatewayBaseUrl}/v1/payments/methods`, {
      method: options.method,
      headers: {
        authorization: options.authorization,
        accept: 'application/json',
        ...(options.body ? { 'content-type': 'application/json' } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
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
            code: gatewayError?.error?.code ?? 'payment_method_request_failed',
            message:
              gatewayError?.error?.message ??
              'Could not load payment methods.',
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
