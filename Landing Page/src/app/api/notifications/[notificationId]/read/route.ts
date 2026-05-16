import { NextResponse } from 'next/server';

const DEFAULT_GATEWAY_BASE_URL = 'http://localhost:5001';

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ notificationId: string }> },
) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const { notificationId } = await params;

  if (!notificationId) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_notification_request',
          message: 'Notification id is required.',
        },
      },
      { status: 400 },
    );
  }

  const gatewayBaseUrl =
    process.env.SERVEASE_API_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL;

  try {
    const response = await fetch(
      `${gatewayBaseUrl}/v1/notifications/${encodeURIComponent(notificationId)}/read`,
      {
        method: 'PATCH',
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
            code: gatewayError?.error?.code ?? 'notification_read_failed',
            message:
              gatewayError?.error?.message ??
              'Could not mark this notification as read.',
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
          code: 'notification_gateway_unavailable',
          message: 'Could not reach the notification service.',
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
