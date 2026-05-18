import { getServerGatewayBaseUrl } from '@/app/lib/gateway-base-url';
import { NextResponse } from 'next/server';
import type { CreatePricingQuoteInput } from '../../../lib/bookings';

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

export async function POST(request: Request) {
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

  const body = (await request.json().catch(() => null)) as
    | CreatePricingQuoteInput
    | null;

  if (
    !body?.providerId ||
    !body.serviceId ||
    !body.serviceAddress?.trim() ||
    !body.scheduledAt
  ) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_pricing_quote_request',
          message: 'Provider, service, address, and schedule are required.',
        },
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${getServerGatewayBaseUrl()}/v1/pricing/quotes`, {
      method: 'POST',
      headers: {
        authorization,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        providerId: body.providerId,
        serviceId: body.serviceId,
        serviceAddress: body.serviceAddress.trim(),
        scheduledAt: body.scheduledAt,
        hoursRequired: body.hoursRequired ?? null,
        bookingUrgency: body.bookingUrgency ?? 'standard',
        region: body.region ?? 'default',
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
            code: gatewayError?.error?.code ?? 'pricing_quote_failed',
            message:
              gatewayError?.error?.message ?? 'Could not calculate a fair estimate.',
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
          code: 'pricing_gateway_unavailable',
          message: 'Could not reach the pricing service.',
        },
      },
      { status: 503 },
    );
  }
}
