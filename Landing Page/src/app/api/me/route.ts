import { NextResponse } from 'next/server';

const DEFAULT_GATEWAY_BASE_URL = 'http://localhost:5001';

interface GatewayErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

interface UpdateProfilePayload {
  fullName?: string;
  contactNumber?: string | null;
  address?: string | null;
  businessName?: string | null;
}

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const gatewayBaseUrl =
    process.env.SERVEASE_API_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL;

  try {
    const response = await fetch(`${gatewayBaseUrl}/v1/me`, {
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
            code: gatewayError?.error?.code ?? 'profile_lookup_failed',
            message:
              gatewayError?.error?.message ??
              'Could not load your account profile.',
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
          code: 'profile_gateway_unavailable',
          message: 'Could not reach the profile service.',
        },
      },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const body = (await request.json().catch(() => null)) as
    | UpdateProfilePayload
    | null;

  if (!body?.fullName?.trim()) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_profile_update_request',
          message: 'Full name is required.',
        },
      },
      { status: 400 },
    );
  }

  const gatewayBaseUrl =
    process.env.SERVEASE_API_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL;

  try {
    const response = await fetch(`${gatewayBaseUrl}/v1/me`, {
      method: 'PATCH',
      headers: {
        authorization,
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        fullName: body.fullName.trim(),
        contactNumber: body.contactNumber?.trim() || null,
        address: body.address?.trim() || null,
        businessName: body.businessName?.trim() || null,
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
            code: gatewayError?.error?.code ?? 'profile_update_failed',
            message:
              gatewayError?.error?.message ??
              'Could not update your account profile.',
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
          code: 'profile_gateway_unavailable',
          message: 'Could not reach the profile service.',
        },
      },
      { status: 503 },
    );
  }
}

export async function DELETE(request: Request) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return authRequired();
  }

  const gatewayBaseUrl =
    process.env.SERVEASE_API_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL;

  try {
    const response = await fetch(`${gatewayBaseUrl}/v1/me`, {
      method: 'DELETE',
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
            code: gatewayError?.error?.code ?? 'account_delete_failed',
            message:
              gatewayError?.error?.message ??
              'Could not delete your account.',
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
          code: 'profile_gateway_unavailable',
          message: 'Could not reach the profile service.',
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
