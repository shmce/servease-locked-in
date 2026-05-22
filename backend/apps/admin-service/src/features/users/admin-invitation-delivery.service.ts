import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createApicenterClient } from '../../../../../libs/common/src';
import {
  AdminAccessRoleId,
  getAdminAccessRoleDefinition,
} from './admin-access-roles';

export interface AdminInvitationDeliveryInput {
  email: string;
  fullName: string;
  temporaryPassword: string;
  accessRole?: AdminAccessRoleId | null;
}

export interface AdminInvitationSender {
  sendInvitation(input: AdminInvitationDeliveryInput): Promise<boolean>;
}

@Injectable()
export class AdminInvitationDeliveryService implements AdminInvitationSender {
  private readonly logger = new Logger(AdminInvitationDeliveryService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendInvitation(input: AdminInvitationDeliveryInput): Promise<boolean> {
    const email = input.email.trim().toLowerCase();
    const fullName = input.fullName.trim();
    const role = getAdminAccessRoleDefinition(input.accessRole);
    const loginUrl = this.loginUrl();
    const templateId = this.templateId();
    const templateData = {
      fullName: fullName || 'there',
      loginUrl,
      temporaryPassword: input.temporaryPassword,
      accessRole: role.id,
      accessRoleLabel: role.label,
    };

    try {
      const client = createApicenterClient({
        APICENTER_URL: this.configService.get<string>('APICENTER_URL'),
        APICENTER_TRIBE_ID: this.configService.get<string>(
          'APICENTER_TRIBE_ID',
        ),
        APICENTER_SERVICE_ID: this.configService.get<string>(
          'APICENTER_SERVICE_ID',
        ),
        APICENTER_TRIBE_SECRET: this.configService.get<string>(
          'APICENTER_TRIBE_SECRET',
        ),
      });

      await client.emailSend({
        to: [{ email, name: fullName || undefined }],
        subject: 'You have been invited to ServEase Admin',
        templateId,
        templateData,
        text: templateId ? undefined : this.textBody(templateData),
        html: templateId ? undefined : this.htmlBody(templateData),
        metadata: {
          source: 'admin-user-invitation',
          accessRole: role.id,
        },
      });

      return true;
    } catch (error) {
      this.logger.warn(
        `Admin invitation email failed for ${email}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  }

  private loginUrl(): string {
    const portalUrl =
      this.configService.get<string>('ADMIN_PORTAL_URL') ??
      this.configService.get<string>('NEXT_PUBLIC_ADMIN_URL') ??
      'http://localhost:3000';
    return `${portalUrl.replace(/\/$/, '')}/login`;
  }

  private templateId(): string | undefined {
    return (
      this.configService.get<string>('ADMIN_INVITATION_TEMPLATE_ID')?.trim() ||
      this.configService
        .get<string>('APICENTER_ADMIN_INVITATION_TEMPLATE_ID')
        ?.trim() ||
      undefined
    );
  }

  private textBody(input: {
    fullName: string;
    accessRoleLabel: string;
    loginUrl: string;
    temporaryPassword: string;
  }): string {
    return [
      `Hi ${input.fullName},`,
      '',
      'You have been invited to ServEase Admin.',
      `Role: ${input.accessRoleLabel}`,
      `Login: ${input.loginUrl}`,
      `Temporary password: ${input.temporaryPassword}`,
      '',
      'Please sign in and update your password after your first login.',
    ].join('\n');
  }

  private htmlBody(input: {
    fullName: string;
    accessRoleLabel: string;
    loginUrl: string;
    temporaryPassword: string;
  }): string {
    return [
      `<p>Hi ${this.escapeHtml(input.fullName)},</p>`,
      '<p>You have been invited to ServEase Admin.</p>',
      `<p><strong>Role:</strong> ${this.escapeHtml(input.accessRoleLabel)}</p>`,
      `<p><strong>Login:</strong> <a href="${this.escapeHtml(
        input.loginUrl,
      )}">${this.escapeHtml(input.loginUrl)}</a></p>`,
      `<p><strong>Temporary password:</strong> ${this.escapeHtml(
        input.temporaryPassword,
      )}</p>`,
      '<p>Please sign in and update your password after your first login.</p>',
    ].join('');
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
