import { NextResponse } from 'next/server';

const DEFAULT_GATEWAY_BASE_URL = 'http://localhost:5001';

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

interface SupportTicketReplyPayload {
  message?: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const { ticketId } = await params;

  return proxyGateway(ticketId, {
    authorization,
    method: 'GET',
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const body = (await request.json().catch(() => null)) as
    | SupportTicketReplyPayload
    | null;

  if (!body?.message?.trim()) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_support_ticket_reply',
          message: 'Reply message is required.',
        },
      },
      { status: 400 },
    );
  }

  const { ticketId } = await params;

  return proxyGateway(ticketId, {
    authorization,
    method: 'POST',
    body: {
      message: body.message.trim(),
    },
  });
}

async function proxyGateway(
  ticketId: string,
  options: {
    authorization: string;
    method: 'GET' | 'POST';
    body?: unknown;
  },
) {
  if (!ticketId) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_support_ticket_request',
          message: 'Support ticket id is required.',
        },
      },
      { status: 400 },
    );
  }

  const gatewayBaseUrl =
    process.env.SERVEASE_API_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL;
  const path = `/v1/support/tickets/${encodeURIComponent(ticketId)}/replies`;

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
            code: gatewayError?.error?.code ?? 'support_ticket_reply_failed',
            message:
              gatewayError?.error?.message ??
              'Could not load support ticket replies.',
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
          code: 'support_gateway_unavailable',
          message: 'Could not reach the support service.',
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
