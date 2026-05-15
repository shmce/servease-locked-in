import { NextResponse } from 'next/server';

const DEFAULT_GATEWAY_BASE_URL = 'http://localhost:5001';

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

interface StatusTransitionPayload {
  currentStatus?: string;
  nextStatus?: string;
  reason?: string | null;
  explanation?: string | null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const { bookingId } = await params;
  return proxyGateway(`/v1/bookings/${encodeURIComponent(bookingId)}`, {
    authorization,
    method: 'GET',
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const body = (await request.json().catch(() => null)) as
    | StatusTransitionPayload
    | null;

  if (!body?.currentStatus || !body.nextStatus) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_booking_transition',
          message: 'Current and next booking status are required.',
        },
      },
      { status: 400 },
    );
  }

  const { bookingId } = await params;
  return proxyGateway(
    `/v1/bookings/${encodeURIComponent(bookingId)}/status`,
    {
      authorization,
      method: 'PATCH',
      body: {
        currentStatus: body.currentStatus,
        nextStatus: body.nextStatus,
        reason: body.reason ?? null,
        explanation: body.explanation ?? null,
      },
    },
  );
}

async function proxyGateway(
  path: string,
  options: {
    authorization: string;
    method: 'GET' | 'PATCH';
    body?: unknown;
  },
) {
  const gatewayBaseUrl =
    process.env.SERVEASE_API_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL;

  try {
    const response = await fetch(`${gatewayBaseUrl}${path}`, {
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
            code: gatewayError?.error?.code ?? 'booking_request_failed',
            message:
              gatewayError?.error?.message ?? 'Booking request failed.',
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
          code: 'booking_gateway_unavailable',
          message: 'Could not reach the booking service.',
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
