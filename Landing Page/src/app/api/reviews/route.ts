import { NextResponse } from 'next/server';
import type { CreateReviewInput } from '../../lib/reviews';

const DEFAULT_GATEWAY_BASE_URL = 'http://localhost:5001';

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const body = (await request.json().catch(() => null)) as
    | CreateReviewInput
    | null;

  if (
    !body?.bookingId?.trim() ||
    !Number.isInteger(body.rating) ||
    body.rating < 1 ||
    body.rating > 5
  ) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_review_request',
          message: 'Booking and a 1 to 5 star rating are required.',
        },
      },
      { status: 400 },
    );
  }

  const gatewayBaseUrl =
    process.env.SERVEASE_API_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL;

  try {
    const response = await fetch(`${gatewayBaseUrl}/v1/reviews`, {
      method: 'POST',
      headers: {
        authorization,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        bookingId: body.bookingId.trim(),
        rating: body.rating,
        reviewText: body.reviewText?.trim() || null,
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
            code: gatewayError?.error?.code ?? 'review_request_failed',
            message:
              gatewayError?.error?.message ?? 'Could not submit your review.',
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
          code: 'review_gateway_unavailable',
          message: 'Could not reach the review service.',
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
