#!/usr/bin/env node
/**
 * Safe APICenter smoke test.
 *
 * The default path authenticates through the official @implementsprint/sdk and
 * verifies that ServEase can discover the shared services it depends on. It
 * does not send email/SMS, create OTPs, or create payment checkouts unless a
 * specific opt-in env flag is set.
 */

import { TribeClient } from '@implementsprint/sdk';
import { loadBackendEnv } from './load-backend-env.mjs';
import process from 'node:process';

loadBackendEnv();

const requiredEnv = [
  'APICENTER_URL',
  'APICENTER_TRIBE_ID',
  'APICENTER_TRIBE_SECRET',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`${key} is required for smoke:apicenter`);
  }
}

const requiredSharedServices = [
  {
    key: 'payment',
    namePattern: /payment/i,
    exposes: ['/checkout/sessions', '/checkout/sessions/:id/status'],
  },
  {
    key: 'gauth',
    namePattern: /google|auth/i,
    exposes: ['/oauth/authorize', '/oauth/token'],
  },
  { key: 'otp', namePattern: /otp/i, exposes: ['/generate', '/verify'] },
  {
    key: 'geo',
    namePattern: /geo/i,
    exposes: ['/geocode', '/reverse-geocode'],
  },
  { key: 'email', namePattern: /email/i, exposes: ['/send', '/status'] },
  { key: 'sms', namePattern: /sms/i, exposes: ['/send', '/status'] },
];

async function main() {
  const client = new TribeClient({
    gatewayUrl: process.env.APICENTER_URL.replace(/\/$/, ''),
    tribeId: process.env.APICENTER_TRIBE_ID.trim(),
    sourceServiceId: process.env.APICENTER_SERVICE_ID?.trim() || undefined,
    secret: process.env.APICENTER_TRIBE_SECRET.trim(),
    timeout: 10_000,
    maxRetries: 1,
  });

  const sharedServices = await client.listSharedServices();
  const missing = requiredSharedServices.filter((required) => {
    const service = sharedServices.find(
      (candidate) =>
        required.namePattern.test(candidate.id ?? '') ||
        required.namePattern.test(candidate.name ?? ''),
    );
    return (
      !service ||
      service.status !== 'active' ||
      required.exposes.some(
        (path) => !(service.exposes ?? []).some((exposed) => exposed === path),
      )
    );
  });

  if (missing.length > 0) {
    throw new Error(
      `APICenter shared service contracts missing: ${missing
        .map((service) => service.key)
        .join(', ')}`,
    );
  }

  if (process.env.APICENTER_SMOKE_GAUTH_AUTHORIZE === 'true') {
    const authorization = await client.gauthGetAuthorizationUrl({
      redirectUri:
        process.env.APICENTER_SMOKE_GAUTH_REDIRECT_URI ??
        'https://servease.test/auth/google/callback',
      scopes: ['openid', 'email', 'profile'],
      state: 'servease-smoke',
    });
    if (!authorization.authorizationUrl) {
      throw new Error(
        'APICenter gauth authorize did not return authorizationUrl',
      );
    }
  }

  if (process.env.APICENTER_SMOKE_GEO_GEOCODE === 'true') {
    const geocode = await client.geoGeocodeAddress({
      address: process.env.APICENTER_SMOKE_GEO_ADDRESS ?? 'Manila, Philippines',
      region: 'PH',
    });
    if (
      !Number.isFinite(geocode.latitude) ||
      !Number.isFinite(geocode.longitude)
    ) {
      throw new Error('APICenter geo geocode did not return coordinates');
    }
  }

  console.log(
    JSON.stringify({
      ok: true,
      apicenterUrl: process.env.APICENTER_URL,
      tribeId: process.env.APICENTER_TRIBE_ID,
      sharedServices: requiredSharedServices.map((service) => service.key),
      optionalGauthAuthorize:
        process.env.APICENTER_SMOKE_GAUTH_AUTHORIZE === 'true',
      optionalGeoGeocode: process.env.APICENTER_SMOKE_GEO_GEOCODE === 'true',
    }),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
