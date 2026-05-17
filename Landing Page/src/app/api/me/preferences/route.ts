import { NextResponse } from 'next/server';

const DEFAULT_GATEWAY_BASE_URL = 'http://localhost:5001';

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

interface UpdatePreferencesPayload {
  pushNotificationsEnabled?: boolean | null;
  darkModeEnabled?: boolean | null;
  language?: string | null;
  notificationPreferences?: Record<string, unknown> | null;
}

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const gatewayBaseUrl =
    process.env.SERVEASE_API_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL;

  try {
    const response = await fetch(`${gatewayBaseUrl}/v1/me/preferences`, {
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
            code: gatewayError?.error?.code ?? 'preferences_lookup_failed',
            message:
              gatewayError?.error?.message ??
              'Could not load your notification preferences.',
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
          code: 'preferences_gateway_unavailable',
          message: 'Could not reach the preferences service.',
        },
      },
      { status: 503 },
    );
  }
}

export async function PUT(request: Request) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const body = (await request.json().catch(() => null)) as
    | UpdatePreferencesPayload
    | null;

  if (!body) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_preferences_update_request',
          message: 'Preferences payload is required.',
        },
      },
      { status: 400 },
    );
  }

  if (
    body.notificationPreferences !== undefined &&
    body.notificationPreferences !== null &&
    (typeof body.notificationPreferences !== 'object' ||
      Array.isArray(body.notificationPreferences))
  ) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_preferences_update_request',
          message: 'notificationPreferences must be an object.',
        },
      },
      { status: 400 },
    );
  }

  const gatewayBaseUrl =
    process.env.SERVEASE_API_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL;

  try {
    const response = await fetch(`${gatewayBaseUrl}/v1/me/preferences`, {
      method: 'PUT',
      headers: {
        authorization,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
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
            code: gatewayError?.error?.code ?? 'preferences_update_failed',
            message:
              gatewayError?.error?.message ??
              'Could not update your notification preferences.',
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
          code: 'preferences_gateway_unavailable',
          message: 'Could not reach the preferences service.',
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
