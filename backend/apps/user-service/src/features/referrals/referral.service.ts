import { Inject, Injectable } from '@nestjs/common';
import { ReferralSummary } from './referral.types';

export const REFERRAL_REPOSITORY = Symbol('REFERRAL_REPOSITORY');

export interface ReferralRepository {
  getSummary(userId: string): Promise<ReferralSummary>;
}

@Injectable()
export class ReferralService {
  constructor(
    @Inject(REFERRAL_REPOSITORY)
    private readonly referralRepository: ReferralRepository,
  ) {}

  getSummary(userId: string): Promise<ReferralSummary> {
    if (!userId.trim()) {
      throw new Error('invalid_referral_request');
    }

    return this.referralRepository.getSummary(userId);
  }
}
