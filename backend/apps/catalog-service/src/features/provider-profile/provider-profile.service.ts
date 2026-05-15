import { Inject, Injectable } from '@nestjs/common';
import {
  CreateProviderProfileInput,
  ProviderPortfolioMediaInput,
  ProviderPortfolioMediaSummary,
  ProviderProfileSummary,
  UpdateProviderProfileInput,
} from './provider-profile.types';

export const PROVIDER_PROFILE_REPOSITORY = Symbol('PROVIDER_PROFILE_REPOSITORY');

export interface ProviderProfileRepository {
  findByUserId(userId: string): Promise<ProviderProfileSummary | null>;
  create(input: CreateProviderProfileInput): Promise<ProviderProfileSummary>;
  update(input: UpdateProviderProfileInput): Promise<ProviderProfileSummary>;
  listPortfolioMedia(providerId: string): Promise<ProviderPortfolioMediaSummary[]>;
  addPortfolioMedia(
    input: ProviderPortfolioMediaInput,
  ): Promise<ProviderPortfolioMediaSummary>;
  deletePortfolioMedia(userId: string, mediaId: string): Promise<void>;
}

@Injectable()
export class EmptyProviderProfileRepository implements ProviderProfileRepository {
  async findByUserId(): Promise<ProviderProfileSummary | null> {
    return null;
  }

  async create(): Promise<ProviderProfileSummary> {
    throw new Error('provider_profile_repository_not_configured');
  }

  async update(): Promise<ProviderProfileSummary> {
    throw new Error('provider_profile_repository_not_configured');
  }

  async listPortfolioMedia(): Promise<ProviderPortfolioMediaSummary[]> {
    return [];
  }

  async addPortfolioMedia(): Promise<ProviderPortfolioMediaSummary> {
    throw new Error('provider_profile_repository_not_configured');
  }

  async deletePortfolioMedia(): Promise<void> {
    throw new Error('provider_profile_repository_not_configured');
  }
}

@Injectable()
export class ProviderProfileService {
  constructor(
    @Inject(PROVIDER_PROFILE_REPOSITORY)
    private readonly providerProfileRepository: ProviderProfileRepository,
  ) {}

  async findByUserId(userId: string): Promise<ProviderProfileSummary | null> {
    return this.providerProfileRepository.findByUserId(userId);
  }

  async create(input: CreateProviderProfileInput): Promise<ProviderProfileSummary> {
    return this.providerProfileRepository.create(input);
  }

  async update(input: UpdateProviderProfileInput): Promise<ProviderProfileSummary> {
    return this.providerProfileRepository.update(input);
  }

  listPortfolioMedia(providerId: string): Promise<ProviderPortfolioMediaSummary[]> {
    return this.providerProfileRepository.listPortfolioMedia(providerId);
  }

  addPortfolioMedia(
    input: ProviderPortfolioMediaInput,
  ): Promise<ProviderPortfolioMediaSummary> {
    if (!input.userId || !input.fileUrl.trim()) {
      throw new Error('invalid_provider_portfolio_request');
    }

    return this.providerProfileRepository.addPortfolioMedia(input);
  }

  deletePortfolioMedia(userId: string, mediaId: string): Promise<void> {
    return this.providerProfileRepository.deletePortfolioMedia(userId, mediaId);
  }
}
