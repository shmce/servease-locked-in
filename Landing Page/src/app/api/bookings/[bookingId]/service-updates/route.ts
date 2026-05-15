import { NextResponse } from 'next/server';

const DEFAULT_GATEWAY_BASE_URL = 'http://localhost:5001';

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
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

  const { bookingId } = await params;
  const gatewayBaseUrl =
    process.env.SERVEASE_API_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL;

  try {
    const response = await fetch(
      `${gatewayBaseUrl}/v1/bookings/${encodeURIComponent(bookingId)}/service-updates`,
      {
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
            code: gatewayError?.error?.code ?? 'booking_updates_lookup_failed',
            message:
              gatewayError?.error?.message ??
              'Could not load booking service updates.',
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
