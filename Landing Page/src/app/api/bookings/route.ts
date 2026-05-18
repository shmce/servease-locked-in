import { getServerGatewayBaseUrl } from '@/app/lib/gateway-base-url';
import { NextResponse } from 'next/server';
import type { CreateBookingInput } from '../../lib/bookings';

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

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope');
  const gatewayBaseUrl =
    getServerGatewayBaseUrl();
  const gatewayPath =
    scope === 'provider' ? '/v1/bookings?scope=provider' : '/v1/bookings';

  try {
    const response = await fetch(`${gatewayBaseUrl}${gatewayPath}`, {
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
            code: gatewayError?.error?.code ?? 'booking_lookup_failed',
            message:
              gatewayError?.error?.message ?? 'Could not load your bookings.',
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

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const body = (await request.json().catch(() => null)) as
    | CreateBookingInput
    | null;

  if (!body?.providerId || !body.serviceAddress?.trim() || !body.scheduledAt) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_booking_request',
          message: 'Provider, service address, and schedule are required.',
        },
      },
      { status: 400 },
    );
  }

  const gatewayBaseUrl =
    getServerGatewayBaseUrl();

  try {
    const response = await fetch(`${gatewayBaseUrl}/v1/bookings`, {
      method: 'POST',
      headers: {
        authorization,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        providerId: body.providerId,
        serviceId: body.serviceId ?? null,
        serviceTitle: body.serviceTitle ?? null,
        serviceName: body.serviceName ?? null,
        serviceDescription: body.serviceDescription ?? null,
        serviceAddress: body.serviceAddress.trim(),
        scheduledAt: body.scheduledAt,
        hoursRequired: body.hoursRequired ?? null,
        serviceAmount: body.serviceAmount ?? null,
        pricingMode: body.pricingMode ?? null,
        acceptedQuoteId: body.acceptedQuoteId ?? null,
        paymentMethod: body.paymentMethod ?? null,
        customerNotes: body.customerNotes?.trim() || null,
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
            code: gatewayError?.error?.code ?? 'booking_request_failed',
            message:
              gatewayError?.error?.message ??
              'Could not create your booking request.',
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
