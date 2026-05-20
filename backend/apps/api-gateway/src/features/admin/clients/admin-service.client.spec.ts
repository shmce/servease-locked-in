import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { AdminDependencyUnavailableError } from '../admin-support.errors';
import { AdminServiceClient } from './admin-service.client';

describe('AdminServiceClient', () => {
  it('preserves structured admin-service errors even when they are 5xx', async () => {
    await withFetchResponse(
      503,
      {
        error: {
          code: 'payment_dependency_unavailable',
          message: 'Payment service is unavailable.',
          details: {},
        },
      },
      async () => {
        const client = new AdminServiceClient(configService());

        await expect(client.listPayments()).rejects.toMatchObject({
          status: 503,
          code: 'payment_dependency_unavailable',
          message: 'Payment service is unavailable.',
        });
      },
    );
  });

  it('keeps unstructured 5xx responses as true admin dependency failures', async () => {
    await withFetchResponse(502, {}, async () => {
      const client = new AdminServiceClient(configService());

      await expect(client.listPayments()).rejects.toBeInstanceOf(
        AdminDependencyUnavailableError,
      );
    });
  });

  it('maps network failures to true admin dependency failures', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = jest
      .fn()
      .mockRejectedValue(new Error('connect ECONNREFUSED')) as unknown as typeof fetch;

    try {
      const client = new AdminServiceClient(configService());

      await expect(client.listPayments()).rejects.toBeInstanceOf(
        AdminDependencyUnavailableError,
      );
    } finally {
      globalThis.fetch = originalFetch;
      jest.restoreAllMocks();
    }
  });

  it('calls the admin-service GasWatch PH fuel sync endpoint', async () => {
    await withFetchResponse(
      200,
      {
        data: {
          id: 'fuel-gaswatch-1',
          region: 'default',
          fuelPricePerLiter: 89.84,
          source: 'gaswatch-ph:diesel:metro-manila-average',
          effectiveAt: '2026-05-19T00:00:00.000Z',
          createdBy: 'admin-1',
          createdAt: '2026-05-19T01:00:00.000Z',
        },
      },
      async () => {
        const client = new AdminServiceClient(configService());

        const row = await client.syncPricingFuelIndexFromGasWatch({
          adminUserId: 'admin-1',
        });

        expect(globalThis.fetch).toHaveBeenCalledWith(
          'http://admin-service.test/internal/admin/pricing/fuel-index/sync',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ adminUserId: 'admin-1' }),
          }),
        );
        expect(row.fuelPricePerLiter).toBe(89.84);
      },
    );
  });

  it('keeps gateway admin controllers from flattening structured admin-service errors', () => {
    const adminFeatureDir = path.resolve(__dirname, '..');
    const controllers = fs
      .readdirSync(adminFeatureDir)
      .filter((name) => name.endsWith('controller.ts'));

    for (const controller of controllers) {
      const filePath = path.join(adminFeatureDir, controller);
      const source = fs.readFileSync(filePath, 'utf8');
      if (
        source.includes('admin_dependency_unavailable') &&
        source.includes("./admin-support.errors'")
      ) {
        expect(source).toContain('AdminServiceRequestError');
        expect(source).toContain('error instanceof AdminServiceRequestError');
      }
    }
  });
});

async function withFetchResponse(
  status: number,
  payload: unknown,
  action: () => Promise<void>,
): Promise<void> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(payload),
  }) as unknown as typeof fetch;

  try {
    await action();
  } finally {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  }
}

function configService(): ConfigService {
  return {
    get: jest.fn().mockReturnValue('http://admin-service.test'),
  } as unknown as ConfigService;
}
