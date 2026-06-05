import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

process.env.SERVEASE_API_BASE_URL = 'http://gateway.test';

const { fetchProviderDetail } = await import('../src/app/lib/provider-detail');

const providerId = 'f87b3f7e-6b54-4cef-852f-854983780c7b';
const calls: string[] = [];

globalThis.fetch = async (input: RequestInfo | URL) => {
  const url = String(input);
  calls.push(url);

  if (url === 'http://gateway.test/v1/catalog/services') {
    return jsonResponse(200, {
      data: [
        {
          id: 'service-1',
          categoryId: 'category-1',
          name: 'Home cleaning',
          description: null,
          price: 500,
          pricingMode: 'flat',
        },
      ],
    });
  }

  if (url === 'http://gateway.test/v1/catalog/providers') {
    return jsonResponse(200, {
      data: [
        {
          id: 'listing-1',
          providerId,
          providerBusinessName: 'Clean Co',
          serviceId: 'service-1',
          title: 'Deep cleaning',
          description: 'Residential deep cleaning',
          price: 1200,
          pricingMode: 'flat',
          averageRating: 4.8,
          reviewCount: 12,
          verificationStatus: 'approved',
        },
      ],
    });
  }

  if (
    url ===
    `http://gateway.test/v1/catalog/providers/${providerId}/portfolio`
  ) {
    return jsonResponse(200, { data: [] });
  }

  if (url === `http://gateway.test/v1/reviews?providerId=${providerId}`) {
    return jsonResponse(200, { data: [] });
  }

  if (
    url ===
    `http://gateway.test/v1/provider/availability/${providerId}`
  ) {
    return jsonResponse(200, {
      data: {
        providerId,
        windows: [
          {
            id: 'window-1',
            dayOfWeek: 'monday',
            startTime: '09:00',
            endTime: '17:00',
            isActive: true,
            sortOrder: 1,
          },
        ],
        daysOff: [
          {
            id: 'day-off-1',
            offDate: '2026-05-20',
            reason: 'Provider unavailable',
          },
        ],
      },
    });
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  });
};

const detail = await fetchProviderDetail('listing-1');

assert.equal(detail?.availability?.providerId, providerId);
assert.equal(detail?.availability?.windows[0]?.dayOfWeek, 'monday');
assert.equal(detail?.availability?.daysOff[0]?.offDate, '2026-05-20');
assert.deepEqual(detail?.loadErrors, {
  portfolio: null,
  availability: null,
  reviews: null,
});
assert.ok(
  calls.includes(`http://gateway.test/v1/provider/availability/${providerId}`),
);

calls.length = 0;

globalThis.fetch = async (input: RequestInfo | URL) => {
  const url = String(input);
  calls.push(url);

  if (url === 'http://gateway.test/v1/catalog/services') {
    return jsonResponse(200, {
      data: [
        {
          id: 'service-1',
          categoryId: 'category-1',
          name: 'Home cleaning',
          description: null,
          price: 500,
          pricingMode: 'flat',
        },
      ],
    });
  }

  if (url === 'http://gateway.test/v1/catalog/providers') {
    return jsonResponse(200, {
      data: [
        {
          id: 'listing-1',
          providerId,
          providerBusinessName: 'Clean Co',
          serviceId: 'service-1',
          title: 'Deep cleaning',
          description: 'Residential deep cleaning',
          price: 1200,
          pricingMode: 'flat',
          averageRating: 4.8,
          reviewCount: 12,
          verificationStatus: 'approved',
        },
      ],
    });
  }

  if (
    url ===
    `http://gateway.test/v1/catalog/providers/${providerId}/portfolio`
  ) {
    return jsonResponse(503, {
      error: { code: 'unavailable', message: 'Portfolio unavailable' },
    });
  }

  if (url === `http://gateway.test/v1/reviews?providerId=${providerId}`) {
    return jsonResponse(200, { data: [] });
  }

  if (
    url ===
    `http://gateway.test/v1/provider/availability/${providerId}`
  ) {
    return jsonResponse(200, {
      data: {
        providerId,
        windows: [],
        daysOff: [],
      },
    });
  }

  return jsonResponse(404, {
    error: { code: 'not_found', message: `Unexpected request ${url}` },
  });
};

const partialDetail = await fetchProviderDetail('listing-1');

assert.deepEqual(partialDetail?.portfolio, []);
assert.match(
  partialDetail?.loadErrors.portfolio ?? '',
  /Gateway request failed/,
);
assert.equal(partialDetail?.loadErrors.availability, null);
assert.equal(partialDetail?.loadErrors.reviews, null);

const availabilityPageSource = readFileSync(
  join(process.cwd(), 'src/provider-app/components/SetAvailabilityPage.tsx'),
  'utf8',
);
assert.match(availabilityPageSource, /planning-only/);
assert.match(availabilityPageSource, /overall start and end time/);

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}
