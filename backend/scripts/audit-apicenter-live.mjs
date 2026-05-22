#!/usr/bin/env node
/**
 * APICenter live audit.
 *
 * Safe by default:
 * - Always checks shared service contracts, Google auth URL generation, and geo.
 * - Only sends SMS/email/OTP when APICENTER_LIVE_AUDIT_SEND=true.
 * - Only creates a PayMongo test checkout when APICENTER_LIVE_AUDIT_PAYMENT=true.
 */

import { TribeClient } from '@implementsprint/sdk';
import { loadBackendEnv } from './load-backend-env.mjs';
import { randomUUID } from 'node:crypto';
import process from 'node:process';

loadBackendEnv();

const requiredEnv = [
  'APICENTER_URL',
  'APICENTER_TRIBE_ID',
  'APICENTER_TRIBE_SECRET',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`${key} is required for audit:apicenter-live`);
  }
}

const runId = `servease-apicenter-audit-${randomUUID()}`;
const now = new Date().toISOString();
const sendLive = process.env.APICENTER_LIVE_AUDIT_SEND === 'true';
const createPayment = process.env.APICENTER_LIVE_AUDIT_PAYMENT === 'true';
const checkOpenRouteService =
  process.env.APICENTER_LIVE_AUDIT_OPENROUTESERVICE === 'true';
const targetPhone = process.env.APICENTER_LIVE_AUDIT_PHONE?.trim() ?? '';
const targetEmail = process.env.APICENTER_LIVE_AUDIT_EMAIL?.trim() ?? '';
const redirectUri =
  process.env.APICENTER_LIVE_AUDIT_GAUTH_REDIRECT_URI?.trim() ??
  'servease://auth/google/callback';

if (sendLive && (!targetPhone || !targetEmail)) {
  throw new Error(
    'APICENTER_LIVE_AUDIT_PHONE and APICENTER_LIVE_AUDIT_EMAIL are required when APICENTER_LIVE_AUDIT_SEND=true',
  );
}

if (createPayment && (!targetPhone || !targetEmail)) {
  throw new Error(
    'APICENTER_LIVE_AUDIT_PHONE and APICENTER_LIVE_AUDIT_EMAIL are required when APICENTER_LIVE_AUDIT_PAYMENT=true',
  );
}

const client = new TribeClient({
  gatewayUrl: process.env.APICENTER_URL.trim().replace(/\/$/, ''),
  tribeId: process.env.APICENTER_TRIBE_ID.trim(),
  sourceServiceId: process.env.APICENTER_SERVICE_ID?.trim() || undefined,
  secret: process.env.APICENTER_TRIBE_SECRET.trim(),
  timeout: 15_000,
  maxRetries: 1,
});

const results = [];

async function check(name, action) {
  const startedAt = Date.now();
  try {
    const data = await action();
    results.push({
      name,
      ok: true,
      ms: Date.now() - startedAt,
      data,
    });
  } catch (error) {
    results.push({
      name,
      ok: false,
      ms: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (!local || !domain) {
    return 'invalid-email';
  }
  return `${local.slice(0, 2)}...@${domain}`;
}

function maskPhone(phone) {
  return phone.length <= 4
    ? '****'
    : `${phone.slice(0, 4)}...${phone.slice(-4)}`;
}

await check('shared-services-contract', async () => {
  const services = await client.listSharedServices();
  const expected = [
    { key: 'payment', pattern: /payment/i },
    { key: 'gauth', pattern: /google|auth/i },
    { key: 'otp', pattern: /otp/i },
    { key: 'geo', pattern: /geo/i },
    { key: 'email', pattern: /email/i },
    { key: 'sms', pattern: /sms/i },
  ];

  const contracts = expected.map((expectedService) => {
    const service = services.find(
      (candidate) =>
        expectedService.pattern.test(candidate.id ?? '') ||
        expectedService.pattern.test(candidate.name ?? ''),
    );

    return {
      key: expectedService.key,
      found: Boolean(service),
      name: service?.name ?? null,
      status: service?.status ?? null,
      exposes: service?.exposes ?? [],
    };
  });

  const missing = contracts.filter(
    (contract) => !contract.found || contract.status !== 'active',
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing or inactive APICenter services: ${missing
        .map((contract) => contract.key)
        .join(', ')}`,
    );
  }

  return contracts;
});

await check('gauth-authorize-url', async () => {
  const response = await client.gauthGetAuthorizationUrl({
    redirectUri,
    scopes: ['openid', 'email', 'profile'],
    state: 'servease-apicenter-audit',
    accessType: 'offline',
    prompt: 'consent',
    includeGrantedScopes: true,
  });
  const url = new URL(response.authorizationUrl);
  return {
    host: url.host,
    responseType: url.searchParams.get('response_type'),
    redirectUri: url.searchParams.get('redirect_uri'),
    scope: url.searchParams.get('scope'),
    hasClientId: Boolean(url.searchParams.get('client_id')),
  };
});

await check('geo-geocode', async () => {
  const response = await client.geoGeocodeAddress({
    address:
      process.env.APICENTER_LIVE_AUDIT_GEO_ADDRESS ??
      'Manila City Hall, Manila, Philippines',
    region: 'PH',
  });
  return {
    formattedAddress: response.formattedAddress,
    latitude: response.latitude,
    longitude: response.longitude,
    provider: response.provider,
  };
});

await check('geo-reverse-geocode', async () => {
  const response = await client.geoReverseGeocode({
    latitude: 14.5908,
    longitude: 120.9814,
  });
  return {
    formattedAddress: response.formattedAddress,
    latitude: response.latitude,
    longitude: response.longitude,
    provider: response.provider,
  };
});

await check('geo-geofence-check', async () => {
  return client.geoFenceCheck({
    latitude: 14.5908,
    longitude: 120.9814,
    fences: [
      {
        fenceId: 'manila-city-hall-test',
        name: 'Manila City Hall Test',
        latitude: 14.5908,
        longitude: 120.9814,
        radiusMeters: 100,
      },
    ],
  });
});

if (sendLive) {
  await check('sms-send', async () => {
    const response = await client.smsSend({
      to: targetPhone,
      message: `ServEase APICenter SMS audit ${now}. Ref ${runId.slice(-8)}.`,
      metadata: { source: 'servease-apicenter-audit', runId },
    });
    let status = null;
    try {
      status = await client.smsGetStatus(response.messageId);
    } catch (error) {
      status = {
        error: error instanceof Error ? error.message : String(error),
      };
    }
    return {
      to: maskPhone(targetPhone),
      provider: response.provider ?? null,
      status: response.status,
      messageId: response.messageId,
      statusCheckStatus: status?.status ?? null,
      statusCheckError: status?.error ?? null,
    };
  });

  await check('email-send', async () => {
    const response = await client.emailSend({
      to: [{ email: targetEmail }],
      subject: `ServEase APICenter email audit ${runId.slice(-8)}`,
      text: `This is a ServEase APICenter email audit sent at ${now}. Ref ${runId}.`,
      metadata: { source: 'servease-apicenter-audit', runId },
    });
    let status = null;
    try {
      status = await client.emailGetStatus(response.messageId);
    } catch (error) {
      status = {
        error: error instanceof Error ? error.message : String(error),
      };
    }
    return {
      to: maskEmail(targetEmail),
      provider: response.provider,
      status: response.status,
      messageId: response.messageId,
      statusCheckStatus: status?.status ?? null,
      statusCheckError: status?.error ?? null,
    };
  });

  await check('otp-generate-sms', async () => {
    const response = await client.otpGenerate({
      target: targetPhone,
      channel: 'sms',
      length: 6,
      expiresInSeconds: 300,
    });
    let status = null;
    try {
      status = await client.otpStatus(response.otpId);
    } catch (error) {
      status = {
        error: error instanceof Error ? error.message : String(error),
      };
    }
    return {
      target: maskPhone(targetPhone),
      otpId: response.otpId,
      channel: response.channel,
      expiresAt: response.expiresAt,
      hasCodeInResponse: Boolean(response.code),
      statusCheckStatus: status?.status ?? null,
      statusCheckError: status?.error ?? null,
    };
  });
}

if (createPayment) {
  await check('payment-checkout-create-and-status', async () => {
    const referenceId = `${runId}-checkout`;
    const session = await client.paymentCreateCheckoutSession({
      referenceId,
      idempotencyKey: referenceId,
      successUrl: 'https://servease.test/payments/success',
      cancelUrl: 'https://servease.test/payments/cancel',
      lineItems: [
        {
          name: 'ServEase APICenter audit test item',
          quantity: 1,
          amount: { currency: 'PHP', value: 100 },
        },
      ],
      customer: {
        email: targetEmail,
        phone: targetPhone,
      },
      metadata: { source: 'servease-apicenter-audit', runId },
    });
    let status = null;
    try {
      status = await client.paymentGetCheckoutStatus(session.checkoutId);
    } catch (error) {
      status = {
        error: error instanceof Error ? error.message : String(error),
      };
    }
    return {
      checkoutId: session.checkoutId,
      provider: session.provider,
      status: session.status,
      providerMode: session.providerMode ?? status?.providerMode ?? null,
      hasRedirectUrl: Boolean(session.redirectUrl),
      statusCheckStatus: status?.status ?? null,
      statusCheckError: status?.error ?? null,
    };
  });
}

if (checkOpenRouteService) {
  await check('openrouteservice-directions', async () => {
    const apiKey = process.env.OPENROUTESERVICE_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('OPENROUTESERVICE_API_KEY is required');
    }

    const response = await fetch(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      {
        method: 'POST',
        headers: {
          authorization: apiKey,
          accept: 'application/json, application/geo+json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [
            [120.9816, 14.5895],
            [121.0244, 14.5547],
          ],
        }),
      },
    );

    const payload = await response.json();
    const feature = payload.features?.[0];
    return {
      status: response.status,
      hasRoute: response.ok && Boolean(feature),
      distanceMeters: feature?.properties?.summary?.distance ?? null,
      durationSeconds: feature?.properties?.summary?.duration ?? null,
      coordinateCount: feature?.geometry?.coordinates?.length ?? 0,
    };
  });
}

console.log(
  JSON.stringify(
    {
      ok: results.every((result) => result.ok),
      runId,
      liveSendsEnabled: sendLive,
      paymentCheckoutEnabled: createPayment,
      openRouteServiceEnabled: checkOpenRouteService,
      results,
    },
    null,
    2,
  ),
);

if (results.some((result) => !result.ok)) {
  process.exitCode = 1;
}
