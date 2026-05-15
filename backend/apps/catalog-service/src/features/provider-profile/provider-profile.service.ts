import { Inject, Injectable } from '@nestjs/common';
import { ProviderProfileSummary } from './provider-profile.types';

export const PROVIDER_PROFILE_REPOSITORY = Symbol('PROVIDER_PROFILE_REPOSITORY');

export interface ProviderProfileRepository {
  findByUserId(userId: string): Promise<ProviderProfileSummary | null>;
}

@Injectable()
export class EmptyProviderProfileRepository implements ProviderProfileRepository {
  async findByUserId(): Promise<ProviderProfileSummary | null> {
    return null;
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
}
