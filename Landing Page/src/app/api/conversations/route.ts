import { NextResponse } from 'next/server';

const DEFAULT_GATEWAY_BASE_URL = 'http://localhost:5001';

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

interface OpenConversationPayload {
  bookingId?: string;
}

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  return proxyGateway('/v1/conversations', {
    authorization,
    method: 'GET',
  });
}

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const body = (await request.json().catch(() => null)) as
    | OpenConversationPayload
    | null;

  if (!body?.bookingId?.trim()) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_conversation_request',
          message: 'Booking id is required.',
        },
      },
      { status: 400 },
    );
  }

  return proxyGateway('/v1/conversations', {
    authorization,
    method: 'POST',
    body: {
      bookingId: body.bookingId.trim(),
    },
  });
}

async function proxyGateway(
  path: string,
  options: {
    authorization: string;
    method: 'GET' | 'POST';
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
            code: gatewayError?.error?.code ?? 'conversation_request_failed',
            message:
              gatewayError?.error?.message ?? 'Conversation request failed.',
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
          code: 'conversation_gateway_unavailable',
          message: 'Could not reach the messaging service.',
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
