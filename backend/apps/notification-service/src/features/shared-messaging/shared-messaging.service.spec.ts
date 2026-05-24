import { createApicenterClient } from '@servease/common';
import { InvalidSharedMessagingRequestError } from './shared-messaging.errors';
import { SharedMessagingService } from './shared-messaging.service';
import { UserPreferenceClient } from '../notifications/user-preference.client';

jest.mock('@servease/common', () => ({
  createApicenterClient: jest.fn(),
}));

const mockCreateApicenterClient = createApicenterClient as jest.Mock;

describe('SharedMessagingService', () => {
  beforeEach(() => {
    mockCreateApicenterClient.mockReset();
  });

  it('sends normalized email through APICenter email', async () => {
    const emailSend = jest.fn().mockResolvedValue({
      messageId: 'message-1',
      provider: 'apicenter',
      status: 'queued',
    });
    mockCreateApicenterClient.mockReturnValue({ emailSend });
    const service = new SharedMessagingService();

    const response = await service.sendEmail({
      to: [{ email: ' User@Example.COM ', name: ' Demo User ' }],
      subject: ' Hello ',
      text: ' Body ',
      metadata: { source: 'test' },
    });

    expect(emailSend).toHaveBeenCalledWith({
      to: [{ email: 'user@example.com', name: 'Demo User' }],
      subject: 'Hello',
      text: 'Body',
      html: undefined,
      templateId: undefined,
      templateData: undefined,
      metadata: { source: 'test' },
    });
    expect(response.messageId).toBe('message-1');
  });

  it('skips APICenter email when the recipient disabled email notifications', async () => {
    const emailSend = jest.fn();
    mockCreateApicenterClient.mockReturnValue({ emailSend });
    const preferenceClient = {
      getByUserId: jest.fn().mockResolvedValue({
        pushNotificationsEnabled: true,
        emailNotificationsEnabled: true,
        smsNotificationsEnabled: true,
        notificationPreferences: { emailNotificationsEnabled: false },
      }),
    } as unknown as UserPreferenceClient;
    const service = new SharedMessagingService(preferenceClient);

    const response = await service.sendEmail({
      to: [{ email: 'user@example.com' }],
      subject: 'Hello',
      text: 'Body',
      metadata: { userId: 'user-1' },
    });

    expect(preferenceClient.getByUserId).toHaveBeenCalledWith('user-1');
    expect(mockCreateApicenterClient).not.toHaveBeenCalled();
    expect(emailSend).not.toHaveBeenCalled();
    expect(response).toEqual({
      messageId: 'preference-skip-email-user-1',
      provider: 'apicenter',
      status: 'skipped',
    });
  });

  it('uses APICenter email when no user preference context is present', async () => {
    const emailSend = jest.fn().mockResolvedValue({
      messageId: 'message-1',
      provider: 'apicenter',
      status: 'queued',
    });
    mockCreateApicenterClient.mockReturnValue({ emailSend });
    const preferenceClient = {
      getByUserId: jest.fn(),
    } as unknown as UserPreferenceClient;
    const service = new SharedMessagingService(preferenceClient);

    await service.sendEmail({
      to: [{ email: 'user@example.com' }],
      subject: 'Hello',
      text: 'Body',
      metadata: { source: 'system' },
    });

    expect(preferenceClient.getByUserId).not.toHaveBeenCalled();
    expect(emailSend).toHaveBeenCalled();
  });

  it('rejects email without recipients or content before APICenter calls', async () => {
    const service = new SharedMessagingService();

    await expect(
      service.sendEmail({ to: [], subject: 'Subject' }),
    ).rejects.toBeInstanceOf(InvalidSharedMessagingRequestError);
    expect(mockCreateApicenterClient).not.toHaveBeenCalled();
  });

  it('rejects invalid email recipients before APICenter calls', async () => {
    const service = new SharedMessagingService();

    await expect(
      service.sendEmail({
        to: [{ email: 'user @example.com' }],
        subject: 'Subject',
        text: 'Body',
      }),
    ).rejects.toBeInstanceOf(InvalidSharedMessagingRequestError);
    expect(mockCreateApicenterClient).not.toHaveBeenCalled();
  });

  it('sends SMS through APICenter SMS', async () => {
    const smsSend = jest.fn().mockResolvedValue({
      messageId: 'sms-1',
      provider: 'apicenter',
      status: 'queued',
    });
    mockCreateApicenterClient.mockReturnValue({ smsSend });
    const service = new SharedMessagingService();

    await service.sendSms({
      to: ' +639171234567 ',
      message: ' Your code is 123456 ',
    });

    expect(smsSend).toHaveBeenCalledWith({
      to: '+639171234567',
      message: 'Your code is 123456',
      senderId: undefined,
      metadata: undefined,
    });
  });

  it('skips APICenter SMS unless the recipient enabled SMS notifications', async () => {
    const smsSend = jest.fn();
    mockCreateApicenterClient.mockReturnValue({ smsSend });
    const preferenceClient = {
      getByUserId: jest.fn().mockResolvedValue({
        pushNotificationsEnabled: true,
        emailNotificationsEnabled: true,
        smsNotificationsEnabled: false,
        notificationPreferences: {},
      }),
    } as unknown as UserPreferenceClient;
    const service = new SharedMessagingService(preferenceClient);

    const response = await service.sendSms({
      to: '+639171234567',
      message: 'Broadcast update',
      metadata: { userId: 'user-1' },
    });

    expect(preferenceClient.getByUserId).toHaveBeenCalledWith('user-1');
    expect(mockCreateApicenterClient).not.toHaveBeenCalled();
    expect(smsSend).not.toHaveBeenCalled();
    expect(response).toEqual({
      messageId: 'preference-skip-sms-user-1',
      provider: 'apicenter',
      status: 'skipped',
    });
  });

  it('sends SMS through APICenter when the recipient enabled SMS notifications', async () => {
    const smsSend = jest.fn().mockResolvedValue({
      messageId: 'sms-1',
      provider: 'apicenter',
      status: 'queued',
    });
    mockCreateApicenterClient.mockReturnValue({ smsSend });
    const preferenceClient = {
      getByUserId: jest.fn().mockResolvedValue({
        pushNotificationsEnabled: true,
        emailNotificationsEnabled: true,
        smsNotificationsEnabled: true,
        notificationPreferences: { smsNotificationsEnabled: true },
      }),
    } as unknown as UserPreferenceClient;
    const service = new SharedMessagingService(preferenceClient);

    await service.sendSms({
      to: '+639171234567',
      message: 'Broadcast update',
      metadata: { userId: 'user-1' },
    });

    expect(smsSend).toHaveBeenCalledWith({
      to: '+639171234567',
      message: 'Broadcast update',
      senderId: undefined,
      metadata: { userId: 'user-1' },
    });
  });
});
