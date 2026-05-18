import { Injectable } from '@nestjs/common';
import { CatalogServiceClient } from '../catalog/clients/catalog-service.client';
import { GeoGatewayService } from '../geo/geo.service';
import { PricingServiceClient } from './clients/pricing-service.client';
import {
  InvalidPricingQuoteRequestError,
  ProviderListingNotFoundError,
} from './pricing.errors';
import {
  CreatePricingQuoteRequest,
  PricingQuoteSummary,
  PricingRouteLocation,
} from './pricing.types';

@Injectable()
export class PricingGatewayService {
  constructor(
    private readonly pricingServiceClient: PricingServiceClient,
    private readonly catalogServiceClient: CatalogServiceClient,
    private readonly geoGatewayService: GeoGatewayService,
  ) {}

  async createQuote(
    customerId: string,
    input: CreatePricingQuoteRequest,
  ): Promise<PricingQuoteSummary> {
    if (
      !customerId ||
      !input.providerId?.trim() ||
      !input.serviceId?.trim() ||
      !input.serviceAddress?.trim() ||
      !input.scheduledAt
    ) {
      throw new InvalidPricingQuoteRequestError();
    }

    const [listing, services] = await Promise.all([
      this.findListing(input.serviceId, input.providerId),
      this.catalogServiceClient.listServices(),
    ]);
    const service = services.find((item) => item.id === input.serviceId);
    const route = await this.resolveRoute(input);

    const providerBasePrice = listing.price ?? service?.price ?? null;
    if (
      providerBasePrice === null ||
      !Number.isFinite(providerBasePrice) ||
      providerBasePrice <= 0
    ) {
      throw new ProviderListingNotFoundError();
    }
    const validProviderBasePrice = providerBasePrice;

    return this.pricingServiceClient.createQuote({
      customerId,
      providerId: listing.providerId,
      serviceId: input.serviceId,
      categoryId: service?.categoryId ?? null,
      categoryName: service?.name ?? listing.title,
      serviceTitle: listing.title,
      providerBasePrice: validProviderBasePrice,
      pricingMode: listing.pricingMode ?? service?.pricingMode ?? 'flat',
      serviceAddress: input.serviceAddress.trim(),
      scheduledAt: input.scheduledAt,
      hoursRequired: input.hoursRequired ?? null,
      bookingUrgency: input.bookingUrgency ?? 'standard',
      distanceKm: route.distanceKm,
      durationMinutes: route.durationMinutes,
      region: input.region?.trim() || 'default',
    });
  }

  validateQuote(quoteId: string) {
    return this.pricingServiceClient.validateQuote(quoteId);
  }

  private async findListing(serviceId: string, providerId: string) {
    const listings = await this.catalogServiceClient.listProviderListings(
      serviceId,
      providerId,
    );
    const listing = listings.find(
      (item) =>
        item.providerId === providerId &&
        item.serviceId === serviceId &&
        item.verificationStatus === 'approved',
    );

    if (!listing) {
      throw new ProviderListingNotFoundError();
    }

    return listing;
  }

  private async resolveRoute(input: CreatePricingQuoteRequest): Promise<{
    distanceKm: number | null;
    durationMinutes: number | null;
  }> {
    if (!this.hasLocation(input.origin) || !this.hasLocation(input.destination)) {
      return { distanceKm: null, durationMinutes: null };
    }

    try {
      const directions = await this.geoGatewayService.directions({
        origin: input.origin,
        destination: input.destination,
        profile: 'driving-car',
      });
      return {
        distanceKm: Number((directions.distanceMeters / 1000).toFixed(2)),
        durationMinutes: Math.ceil(directions.durationSeconds / 60),
      };
    } catch {
      return { distanceKm: null, durationMinutes: null };
    }
  }

  private hasLocation(
    location: PricingRouteLocation | null | undefined,
  ): location is PricingRouteLocation {
    return (
      typeof location?.latitude === 'number' &&
      Number.isFinite(location.latitude) &&
      Math.abs(location.latitude) <= 90 &&
      typeof location.longitude === 'number' &&
      Number.isFinite(location.longitude) &&
      Math.abs(location.longitude) <= 180
    );
  }
}
