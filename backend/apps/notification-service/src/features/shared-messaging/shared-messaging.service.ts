import { Injectable } from '@nestjs/common';
import { createApicenterClient } from '../../../../../libs/common/src';
import {
  InvalidSharedMessagingRequestError,
  SharedMessagingDependencyUnavailableError,
} from './shared-messaging.errors';
import {
  SharedEmailSendRequest,
  SharedMessageResponse,
  SharedMessageStatus,
  SharedSmsSendRequest,
} from './shared-messaging.types';

const MAX_EMAIL_LENGTH = 254;
const MAX_EMAIL_LOCAL_LENGTH = 64;
const MAX_EMAIL_DOMAIN_LABEL_LENGTH = 63;

function hasWhitespace(value: string): boolean {
  for (const character of value) {
    if (character.trim() === '') {
      return true;
    }
  }
  return false;
}

function isValidEmailAddress(value: string | undefined): value is string {
  if (!value || value.length > MAX_EMAIL_LENGTH || hasWhitespace(value)) {
    return false;
  }

  const atIndex = value.indexOf('@');
  if (atIndex <= 0 || atIndex !== value.lastIndexOf('@')) {
    return false;
  }

  const local = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);
  if (
    !domain.includes('.') ||
    local.length > MAX_EMAIL_LOCAL_LENGTH ||
    domain.startsWith('.') ||
    domain.endsWith('.') ||
    domain.includes('..')
  ) {
    return false;
  }

  return domain
    .split('.')
    .every(
      (label) =>
        label.length > 0 && label.length <= MAX_EMAIL_DOMAIN_LABEL_LENGTH,
    );
}

@Injectable()
export class SharedMessagingService {
  async sendEmail(
    input: SharedEmailSendRequest,
  ): Promise<SharedMessageResponse> {
    const to = input.to
      ?.map((recipient) => ({
        email: recipient.email?.trim().toLowerCase(),
        name: recipient.name?.trim() || undefined,
      }))
      .filter((recipient) => isValidEmailAddress(recipient.email));

    if (
      !to?.length ||
      !input.subject?.trim() ||
      (!input.text?.trim() && !input.html?.trim() && !input.templateId?.trim())
    ) {
      throw new InvalidSharedMessagingRequestError();
    }

    try {
      const client = createApicenterClient();
      return await client.emailSend({
        to,
        subject: input.subject.trim(),
        text: input.text?.trim() || undefined,
        html: input.html?.trim() || undefined,
        templateId: input.templateId?.trim() || undefined,
        templateData: input.templateData,
        metadata: input.metadata,
      });
    } catch (error) {
      if (error instanceof InvalidSharedMessagingRequestError) {
        throw error;
      }
      throw new SharedMessagingDependencyUnavailableError();
    }
  }

  async getEmailStatus(messageId: string): Promise<SharedMessageStatus> {
    const normalized = messageId.trim();
    if (!normalized) {
      throw new InvalidSharedMessagingRequestError();
    }

    try {
      return await createApicenterClient().emailGetStatus(normalized);
    } catch (error) {
      if (error instanceof InvalidSharedMessagingRequestError) {
        throw error;
      }
      throw new SharedMessagingDependencyUnavailableError();
    }
  }

  async sendSms(input: SharedSmsSendRequest): Promise<SharedMessageResponse> {
    const to = input.to?.trim();
    const message = input.message?.trim();
    if (!to || !message) {
      throw new InvalidSharedMessagingRequestError();
    }

    try {
      return await createApicenterClient().smsSend({
        to,
        message,
        senderId: input.senderId?.trim() || undefined,
        metadata: input.metadata,
      });
    } catch (error) {
      if (error instanceof InvalidSharedMessagingRequestError) {
        throw error;
      }
      throw new SharedMessagingDependencyUnavailableError();
    }
  }

  async getSmsStatus(messageId: string): Promise<SharedMessageStatus> {
    const normalized = messageId.trim();
    if (!normalized) {
      throw new InvalidSharedMessagingRequestError();
    }

    try {
      return await createApicenterClient().smsGetStatus(normalized);
    } catch (error) {
      if (error instanceof InvalidSharedMessagingRequestError) {
        throw error;
      }
      throw new SharedMessagingDependencyUnavailableError();
    }
  }
}
