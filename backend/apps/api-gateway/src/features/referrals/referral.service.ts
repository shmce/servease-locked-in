import { Injectable } from '@nestjs/common';
import { UserServiceClient } from '../current-user/clients/user-service.client';
import { ReferralSummary } from './referral.types';

@Injectable()
export class ReferralGatewayService {
  constructor(private readonly userServiceClient: UserServiceClient) {}

  getSummary(userId: string): Promise<ReferralSummary> {
    return this.userServiceClient.getReferralSummary(userId);
  }
}
