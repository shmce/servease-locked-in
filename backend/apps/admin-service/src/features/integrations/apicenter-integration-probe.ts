import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TribeClient, type ServiceDiscoveryEntry } from '@implementsprint/sdk';

type ApicenterServiceDiscoveryEntry = ServiceDiscoveryEntry & {
  canAccess?: boolean;
};

export interface IntegrationProbeResult {
  success: boolean;
  errorMessage: string | null;
}

const providerSharedServiceMap: Record<string, string> = {
  gcash: 'payment',
  google_maps: 'geo',
  paymaya: 'payment',
  sendgrid: 'email',
  stripe: 'payment',
  twilio: 'sms',
};

@Injectable()
export class ApicenterIntegrationProbe {
  constructor(private readonly configService: ConfigService) {}

  async testProvider(provider: string): Promise<IntegrationProbeResult | null> {
    const sharedServiceId = providerSharedServiceMap[provider.trim()];
    if (!sharedServiceId || !this.isConfigured()) {
      return null;
    }

    try {
      const client = this.createClient();
      await client.authenticate();
      const services =
        (await client.listSharedServices()) as ApicenterServiceDiscoveryEntry[];
      const service = services.find(
        (item) => item.serviceId === sharedServiceId,
      );

      if (!service) {
        return {
          success: false,
          errorMessage: `APICenter shared service "${sharedServiceId}" is not registered.`,
        };
      }

      if (service.status !== 'active') {
        return {
          success: false,
          errorMessage: `APICenter shared service "${sharedServiceId}" is ${service.status ?? 'not active'}.`,
        };
      }

      if (service.canAccess === false) {
        return {
          success: false,
          errorMessage: `APICenter denies this tribe access to shared service "${sharedServiceId}".`,
        };
      }

      return {
        success: true,
        errorMessage: null,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: `APICenter probe failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  private isConfigured(): boolean {
    return Boolean(
      this.gatewayUrl() &&
        this.configService.get<string>('APICENTER_TRIBE_ID')?.trim() &&
        this.configService.get<string>('APICENTER_TRIBE_SECRET')?.trim(),
    );
  }

  private createClient(): TribeClient {
    const sourceServiceId = this.configService
      .get<string>('APICENTER_SERVICE_ID')
      ?.trim();

    return new TribeClient({
      gatewayUrl: this.gatewayUrl(),
      tribeId:
        this.configService.get<string>('APICENTER_TRIBE_ID')?.trim() ?? '',
      ...(sourceServiceId ? { sourceServiceId } : {}),
      secret:
        this.configService.get<string>('APICENTER_TRIBE_SECRET')?.trim() ?? '',
    });
  }

  private gatewayUrl(): string {
    return (
      this.configService.get<string>('APICENTER_URL')?.replace(/\/$/, '') ?? ''
    );
  }
}
