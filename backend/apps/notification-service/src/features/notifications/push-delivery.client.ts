import { Injectable, Logger } from '@nestjs/common';
import {
  ActivePushDevice,
  NotificationMetadata,
  NotificationSummary,
} from './notification.types';

interface ExpoPushMessage {
  to: string;
  title?: string;
  body?: string;
  data: Record<string, unknown>;
  sound?: 'default';
}

interface PreparedExpoPushMessage {
  token: string;
  message: ExpoPushMessage;
}

interface ExpoPushTicket {
  id?: string;
  status?: string;
  message?: string;
  details?: {
    error?: string;
  };
}

interface ExpoPushReceipt {
  status?: string;
  message?: string;
  details?: {
    error?: string;
  };
}

export interface PushReceiptCheck {
  ticketId: string;
  token: string;
}

export interface PushReceiptResult {
  checked: number;
  invalidTokens: string[];
}

export interface PushDeliveryResult {
  attempted: number;
  delivered: number;
  skipped: number;
  invalidTokens: string[];
  receiptChecks: PushReceiptCheck[];
}

@Injectable()
export class PushDeliveryClient {
  private readonly logger = new Logger(PushDeliveryClient.name);

  async sendNotification(
    devices: ActivePushDevice[],
    notification: NotificationSummary,
  ): Promise<PushDeliveryResult> {
    const preparedMessages = devices
      .map((device) => this.toExpoMessage(device, notification))
      .filter(
        (message): message is PreparedExpoPushMessage => message !== null,
      );

    if (preparedMessages.length === 0) {
      return {
        attempted: 0,
        delivered: 0,
        skipped: devices.length,
        invalidTokens: [],
        receiptChecks: [],
      };
    }

    const response = await this.postExpoMessages(
      preparedMessages.map((item) => item.message),
    );

    const tickets = await this.readTickets(response);
    const invalidTokens = tickets
      .map((ticket, index) =>
        ticket.details?.error === 'DeviceNotRegistered'
          ? preparedMessages[index]?.token
          : null,
      )
      .filter((token): token is string => Boolean(token));
    const delivered =
      tickets.length > 0
        ? tickets.filter((ticket) => ticket.status === 'ok').length
        : preparedMessages.length;
    const receiptChecks = tickets
      .map((ticket, index) =>
        ticket.id && preparedMessages[index]?.token
          ? {
              ticketId: ticket.id,
              token: preparedMessages[index].token,
            }
          : null,
      )
      .filter((item): item is PushReceiptCheck => item !== null);

    return {
      attempted: preparedMessages.length,
      delivered,
      skipped: devices.length - preparedMessages.length,
      invalidTokens,
      receiptChecks,
    };
  }

  async checkReceipts(
    checks: PushReceiptCheck[],
  ): Promise<PushReceiptResult> {
    if (checks.length === 0) {
      return {
        checked: 0,
        invalidTokens: [],
      };
    }

    const response = await fetch(this.receiptEndpoint(), {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        ids: checks.map((check) => check.ticketId),
      }),
    });

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new Error(
        `Expo push receipt lookup failed: ${response.status} ${message}`,
      );
    }

    const receipts = await this.readReceipts(response);
    const invalidTokens = checks
      .map((check) =>
        receipts[check.ticketId]?.details?.error === 'DeviceNotRegistered'
          ? check.token
          : null,
      )
      .filter((token): token is string => Boolean(token));

    return {
      checked: Object.keys(receipts).length,
      invalidTokens,
    };
  }

  private toExpoMessage(
    device: ActivePushDevice,
    notification: NotificationSummary,
  ): PreparedExpoPushMessage | null {
    if (!this.isExpoPushToken(device.token)) {
      this.logger.debug(`Skipping unsupported push token for ${device.platform}`);
      return null;
    }

    return {
      token: device.token,
      message: {
        to: device.token,
        title: notification.title ?? undefined,
        body: notification.body ?? undefined,
        sound: 'default',
        data: {
          notificationId: notification.id,
          type: notification.type,
          ...(this.metadataObject(notification.metadata) ?? {}),
        },
      },
    };
  }

  private async readTickets(response: Response): Promise<ExpoPushTicket[]> {
    try {
      const payload = (await response.json()) as { data?: ExpoPushTicket | ExpoPushTicket[] };
      if (Array.isArray(payload.data)) {
        return payload.data;
      }

      return payload.data ? [payload.data] : [];
    } catch {
      return [];
    }
  }

  private async readReceipts(
    response: Response,
  ): Promise<Record<string, ExpoPushReceipt>> {
    try {
      const payload = (await response.json()) as {
        data?: Record<string, ExpoPushReceipt>;
      };
      return payload.data ?? {};
    } catch {
      return {};
    }
  }

  private async postExpoMessages(
    messages: ExpoPushMessage[],
  ): Promise<Response> {
    const maxAttempts = this.maxAttempts();
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      let response: Response;
      try {
        response = await fetch(this.endpoint(), {
          method: 'POST',
          headers: this.headers(),
          body: JSON.stringify(messages),
        });
      } catch (error) {
        lastError = error;
        if (attempt === maxAttempts) {
          throw error;
        }
        continue;
      }

      if (response.ok) {
        return response;
      }

      const message = await response.text().catch(() => response.statusText);
      lastError = new Error(
        `Expo push delivery failed: ${response.status} ${message}`,
      );

      if (!this.isRetryableStatus(response.status) || attempt === maxAttempts) {
        throw lastError;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('Expo push delivery failed.');
  }

  private metadataObject(
    metadata: NotificationMetadata,
  ): Record<string, unknown> | null {
    if (!metadata || Array.isArray(metadata)) {
      return null;
    }

    return metadata;
  }

  private isExpoPushToken(token: string): boolean {
    return /^Expo(nent)?PushToken\[[^\]]+\]$/.test(token);
  }

  private endpoint(): string {
    return (
      process.env.EXPO_PUSH_API_URL ?? 'https://exp.host/--/api/v2/push/send'
    );
  }

  private receiptEndpoint(): string {
    return (
      process.env.EXPO_PUSH_RECEIPTS_API_URL ??
      'https://exp.host/--/api/v2/push/getReceipts'
    );
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (process.env.EXPO_ACCESS_TOKEN) {
      headers.Authorization = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;
    }

    return headers;
  }

  private maxAttempts(): number {
    const value = Number(process.env.EXPO_PUSH_MAX_ATTEMPTS ?? 2);
    if (!Number.isFinite(value)) {
      return 2;
    }

    return Math.min(Math.max(Math.floor(value), 1), 5);
  }

  private isRetryableStatus(status: number): boolean {
    return (
      status === 408 ||
      status === 409 ||
      status === 425 ||
      status === 429 ||
      status >= 500
    );
  }
}
