import { NextResponse } from 'next/server';

const DEFAULT_GATEWAY_BASE_URL = 'http://localhost:5001';

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

interface MessagePayload {
  content?: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const { conversationId } = await params;
  return proxyGateway(conversationId, {
    authorization,
    method: 'GET',
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const body = (await request.json().catch(() => null)) as
    | MessagePayload
    | null;

  if (!body?.content?.trim()) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_message_request',
          message: 'Message content is required.',
        },
      },
      { status: 400 },
    );
  }

  const { conversationId } = await params;
  return proxyGateway(conversationId, {
    authorization,
    method: 'POST',
    body: {
      content: body.content.trim(),
    },
  });
}

async function proxyGateway(
  conversationId: string,
  options: {
    authorization: string;
    method: 'GET' | 'POST';
    body?: unknown;
  },
) {
  if (!conversationId) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_conversation_request',
          message: 'Conversation id is required.',
        },
      },
      { status: 400 },
    );
  }

  const gatewayBaseUrl =
    process.env.SERVEASE_API_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL;
  const path = `/v1/conversations/${encodeURIComponent(conversationId)}/messages`;

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
            code: gatewayError?.error?.code ?? 'conversation_message_failed',
            message:
              gatewayError?.error?.message ?? 'Conversation message failed.',
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
