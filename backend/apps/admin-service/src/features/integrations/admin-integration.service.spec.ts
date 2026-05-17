import { AdminIntegrationService } from './admin-integration.service';
import { ApicenterIntegrationProbe } from './apicenter-integration-probe';
import { SupabaseAdminIntegrationRepository } from './supabase-admin-integration.repository';

describe('AdminIntegrationService', () => {
  it('uses APICenter SDK probe results when testing a configured integration', async () => {
    const existing = {
      provider: 'twilio',
      displayName: 'Twilio SMS',
      category: 'messaging',
      isEnabled: true,
      status: 'active',
      webhookUrl: null,
      apiKeyPreview: null,
      lastTestedAt: null,
      lastError: null,
      updatedBy: null,
      updatedAt: null,
      createdAt: null,
    };
    const repository = {
      getIntegration: jest.fn().mockResolvedValue(existing),
      recordTestResult: jest.fn().mockResolvedValue({
        ...existing,
        status: 'error',
        lastError:
          'APICenter denies this tribe access to shared service "sms".',
      }),
    } as unknown as SupabaseAdminIntegrationRepository;
    const probe = {
      testProvider: jest.fn().mockResolvedValue({
        success: false,
        errorMessage:
          'APICenter denies this tribe access to shared service "sms".',
      }),
    } as unknown as ApicenterIntegrationProbe;
    const service = new AdminIntegrationService(repository, probe);

    await service.test({
      provider: 'twilio',
      success: true,
      adminUserId: 'admin-1',
    });

    expect(probe.testProvider).toHaveBeenCalledWith('twilio');
    expect(repository.recordTestResult).toHaveBeenCalledWith({
      provider: 'twilio',
      success: false,
      errorMessage:
        'APICenter denies this tribe access to shared service "sms".',
      adminUserId: 'admin-1',
    });
  });
});
