import { createApicenterClient } from '@servease/common';
import { InvalidSharedMessagingRequestError } from './shared-messaging.errors';
import { SharedMessagingService } from './shared-messaging.service';

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

  it('rejects email without recipients or content before APICenter calls', async () => {
    const service = new SharedMessagingService();

    await expect(
      service.sendEmail({ to: [], subject: 'Subject' }),
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
});

