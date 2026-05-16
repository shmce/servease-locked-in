import { UserServiceClient } from '../current-user/clients/user-service.client';
import { ReferralGatewayService } from './referral.service';

describe('ReferralGatewayService', () => {
  it('forwards referral summary reads to user-service', async () => {
    const userServiceClient = {
      getReferralSummary: jest.fn().mockResolvedValue({
        referralCode: 'SE-ABC12345',
        referralLinkPath: '/signup?ref=SE-ABC12345',
        completedReferrals: 2,
        pendingReferrals: 1,
        totalRewards: 300,
      }),
    } as unknown as UserServiceClient;
    const service = new ReferralGatewayService(userServiceClient);

    const summary = await service.getSummary('user-1');

    expect(userServiceClient.getReferralSummary).toHaveBeenCalledWith('user-1');
    expect(summary.referralCode).toBe('SE-ABC12345');
  });
});
