import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  HttpException,
  Param,
  Post,
} from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import {
  AdminRequiredError,
  AdminServiceRequestError,
} from './admin-support.errors';
import { AdminBookingGatewayService } from './admin-booking.service';
import { AdminBookingSummary } from './admin-booking.types';
import { AdminPaymentGatewayService } from './admin-payment.service';
import {
  PaymentSummary,
  PayoutSummary,
  RefundSummary,
} from './admin-payment.types';
import { AdminUsersGatewayService } from './admin-users.service';
import { AdminUserSummary } from './admin-users.types';
import { AdminServiceClient } from './clients/admin-service.client';
import {
  AdminReportFormat,
  AdminReportFrequency,
  AdminReportType,
  ScheduledAdminReportResponse,
} from './admin-report.types';

interface GenerateAdminReportRequest {
  format?: string;
  dateRange?: string;
}

interface ScheduleAdminReportRequest {
  name?: string;
  frequency?: string;
  recipients?: string[] | string;
  format?: string;
}

interface AdminReportDataset {
  title: string;
  headers: string[];
  rows: string[][];
}

interface GeneratedAdminReportResponse {
  id: string;
  type: AdminReportType;
  format: AdminReportFormat;
  status: 'ready';
  generatedAt: string;
  fileName: string;
  downloadPath: string;
  rowCount: number;
  dateRange: string | null;
}

const reportTypes = new Set<AdminReportType>([
  'bookings',
  'revenue',
  'users',
  'financial',
]);

const reportFormats = new Set<AdminReportFormat>(['csv', 'pdf']);
const reportFrequencies = new Set<AdminReportFrequency>([
  'daily',
  'weekly',
  'monthly',
]);

@Controller('v1/admin/reports')
export class AdminReportController {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
    private readonly adminBookingGatewayService: AdminBookingGatewayService,
    private readonly adminPaymentGatewayService: AdminPaymentGatewayService,
    private readonly adminUsersGatewayService: AdminUsersGatewayService,
    private readonly adminServiceClient: AdminServiceClient,
  ) {}

  @Get('revenue.csv')
  @Header('content-type', 'text/csv; charset=utf-8')
  @Header('content-disposition', 'attachment; filename="servease-revenue.csv"')
  async revenueCsv(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<string> {
    try {
      await this.requireAdmin(authorization);
      const payments = await this.adminPaymentGatewayService.listPayments();
      return this.toRevenueCsv(payments);
    } catch (error) {
      throw this.handleExportError(error, 'Revenue report export failed.');
    }
  }

  @Get('users.csv')
  @Header('content-type', 'text/csv; charset=utf-8')
  @Header('content-disposition', 'attachment; filename="servease-users.csv"')
  async usersCsv(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<string> {
    try {
      await this.requireAdmin(authorization);
      const users = await this.adminUsersGatewayService.listUsers(
        null,
        null,
        null,
      );
      return this.toUsersCsv(users);
    } catch (error) {
      throw this.handleExportError(error, 'User report export failed.');
    }
  }

  @Get('financial.csv')
  @Header('content-type', 'text/csv; charset=utf-8')
  @Header(
    'content-disposition',
    'attachment; filename="servease-financial.csv"',
  )
  async financialCsv(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<string> {
    try {
      await this.requireAdmin(authorization);
      const [payments, payouts, refunds] = await Promise.all([
        this.adminPaymentGatewayService.listPayments(),
        this.adminPaymentGatewayService.listPayouts(),
        this.adminPaymentGatewayService.listRefunds(),
      ]);
      return this.toFinancialCsv(payments, payouts, refunds);
    } catch (error) {
      throw this.handleExportError(error, 'Financial report export failed.');
    }
  }

  @Get('bookings.csv')
  @Header('content-type', 'text/csv; charset=utf-8')
  @Header('content-disposition', 'attachment; filename="servease-bookings.csv"')
  async bookingsCsv(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<string> {
    try {
      await this.requireAdmin(authorization);
      const bookings = await this.adminBookingGatewayService.listBookings({
        limit: 1000,
        query: null,
        status: null,
      });
      return this.toBookingsCsv(bookings);
    } catch (error) {
      throw this.handleExportError(error, 'Booking report export failed.');
    }
  }

  @Get(':type/schedules')
  async listSchedules(
    @Param('type') type: string,
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: ScheduledAdminReportResponse[] }> {
    try {
      await this.requireAdmin(authorization);
      const reportType = this.requireReportType(type);
      return {
        data: await this.adminServiceClient.listAdminReportSchedules(
          reportType,
          100,
        ),
      };
    } catch (error) {
      throw this.handleReportError(error, 'Report schedule listing failed.');
    }
  }

  @Get(':type.pdf')
  @Header('content-type', 'application/pdf')
  @Header('content-disposition', 'attachment; filename="servease-report.pdf"')
  async reportPdf(
    @Param('type') type: string,
    @Headers('authorization') authorization: string | undefined,
  ): Promise<string> {
    try {
      await this.requireAdmin(authorization);
      const reportType = this.requireReportType(type);
      const dataset = await this.buildReportDataset(reportType);
      return this.toPdf(dataset);
    } catch (error) {
      throw this.handleReportError(error, 'PDF report export failed.');
    }
  }

  @Post(':type')
  async generate(
    @Param('type') type: string,
    @Headers('authorization') authorization: string | undefined,
    @Body() body: GenerateAdminReportRequest = {},
  ): Promise<{ data: GeneratedAdminReportResponse }> {
    try {
      await this.requireAdmin(authorization);
      const reportType = this.requireReportType(type);
      const format = this.requireReportFormat(body.format ?? 'csv');
      const dataset = await this.buildReportDataset(reportType);
      const generatedAt = new Date().toISOString();

      return {
        data: {
          id: this.buildReportId(reportType, generatedAt),
          type: reportType,
          format,
          status: 'ready',
          generatedAt,
          fileName: this.buildReportFileName(reportType, format, generatedAt),
          downloadPath: `/v1/admin/reports/${reportType}.${format}`,
          rowCount: dataset.rows.length,
          dateRange: body.dateRange?.trim() || null,
        },
      };
    } catch (error) {
      throw this.handleReportError(error, 'Report generation failed.');
    }
  }

  @Post(':type/schedules')
  async schedule(
    @Param('type') type: string,
    @Headers('authorization') authorization: string | undefined,
    @Body() body: ScheduleAdminReportRequest = {},
  ): Promise<{ data: ScheduledAdminReportResponse }> {
    try {
      const adminUserId = await this.requireAdmin(authorization);
      const reportType = this.requireReportType(type);
      const format = this.requireReportFormat(body.format ?? 'csv');
      const frequency = this.requireReportFrequency(body.frequency ?? 'weekly');
      const recipients = this.normalizeRecipients(body.recipients);
      if (recipients.length === 0) {
        throw this.error(
          'invalid_report_schedule',
          'At least one report recipient is required.',
          400,
        );
      }

      return {
        data: await this.adminServiceClient.createAdminReportSchedule({
          adminUserId,
          type: reportType,
          format,
          name: body.name?.trim() || `${this.titleCase(reportType)} report`,
          frequency,
          recipients,
        }),
      };
    } catch (error) {
      throw this.handleReportError(error, 'Report scheduling failed.');
    }
  }

  private async requireAdmin(
    authorization: string | undefined,
  ): Promise<string> {
    const userId = await this.authTokenService.authenticate(authorization);
    const currentUser = await this.currentUserService.getCurrentUser(userId);
    if (currentUser.user.role !== 'admin') {
      throw new AdminRequiredError();
    }
    return userId;
  }

  private handleExportError(error: unknown, fallback: string): HttpException {
    if (error instanceof AdminRequiredError) {
      return this.error('admin_required', 'An admin account is required.', 403);
    }
    if (error instanceof AdminServiceRequestError) {
      return this.error(error.code, error.message, error.status);
    }

    return this.error('admin_dependency_unavailable', fallback, 503);
  }

  private handleReportError(error: unknown, fallback: string): HttpException {
    if (error instanceof HttpException) {
      return error;
    }
    return this.handleExportError(error, fallback);
  }

  private requireReportType(type: string): AdminReportType {
    if (reportTypes.has(type as AdminReportType)) {
      return type as AdminReportType;
    }
    throw this.error(
      'invalid_report_type',
      'Supported reports are bookings, revenue, users, and financial.',
      400,
    );
  }

  private requireReportFormat(format: string): AdminReportFormat {
    const normalized = format.trim().toLowerCase();
    if (reportFormats.has(normalized as AdminReportFormat)) {
      return normalized as AdminReportFormat;
    }
    throw this.error(
      'invalid_report_format',
      'Supported report formats are csv and pdf.',
      400,
    );
  }

  private requireReportFrequency(frequency: string): AdminReportFrequency {
    const normalized = frequency.trim().toLowerCase();
    if (reportFrequencies.has(normalized as AdminReportFrequency)) {
      return normalized as AdminReportFrequency;
    }
    throw this.error(
      'invalid_report_schedule',
      'Supported report frequencies are daily, weekly, and monthly.',
      400,
    );
  }

  private normalizeRecipients(
    recipients: string[] | string | undefined,
  ): string[] {
    if (Array.isArray(recipients)) {
      return recipients
        .map((recipient) => recipient.trim())
        .filter((recipient) => recipient.includes('@'));
    }
    if (typeof recipients === 'string') {
      return recipients
        .split(',')
        .map((recipient) => recipient.trim())
        .filter((recipient) => recipient.includes('@'));
    }
    return [];
  }

  private buildReportId(type: AdminReportType, timestamp: string): string {
    return `report_${type}_${timestamp.replace(/[-:.TZ]/g, '').slice(0, 14)}`;
  }

  private buildReportFileName(
    type: AdminReportType,
    format: AdminReportFormat,
    timestamp: string,
  ): string {
    return `servease-${type}-${timestamp.slice(0, 10)}.${format}`;
  }

  private async buildReportDataset(
    type: AdminReportType,
  ): Promise<AdminReportDataset> {
    if (type === 'bookings') {
      const bookings = await this.adminBookingGatewayService.listBookings({
        limit: 1000,
        query: null,
        status: null,
      });
      return this.bookingsDataset(bookings);
    }
    if (type === 'revenue') {
      return this.revenueDataset(
        await this.adminPaymentGatewayService.listPayments(),
      );
    }
    if (type === 'users') {
      return this.usersDataset(
        await this.adminUsersGatewayService.listUsers(null, null, null),
      );
    }

    const [payments, payouts, refunds] = await Promise.all([
      this.adminPaymentGatewayService.listPayments(),
      this.adminPaymentGatewayService.listPayouts(),
      this.adminPaymentGatewayService.listRefunds(),
    ]);
    return this.financialDataset(payments, payouts, refunds);
  }

  private bookingsDataset(bookings: AdminBookingSummary[]): AdminReportDataset {
    const headers = [
      'bookingReference',
      'customer',
      'providerId',
      'serviceTitle',
      'serviceAddress',
      'scheduledAt',
      'status',
      'totalAmount',
      'cancelReason',
      'cancelExplanation',
      'createdAt',
    ];
    return {
      title: 'ServEase Booking Report',
      headers,
      rows: bookings.map((booking) => [
        booking.bookingReference,
        booking.customerFullName ?? booking.customerId,
        booking.providerId,
        booking.serviceTitle ?? '',
        booking.serviceAddress ?? '',
        booking.scheduledAt,
        booking.status,
        String(booking.totalAmount),
        booking.cancelReason ?? '',
        booking.cancelExplanation ?? '',
        booking.createdAt ?? '',
      ]),
    };
  }

  private toBookingsCsv(bookings: AdminBookingSummary[]): string {
    const dataset = this.bookingsDataset(bookings);
    return this.toCsv(dataset.headers, dataset.rows);
  }

  private revenueDataset(payments: PaymentSummary[]): AdminReportDataset {
    const headers = [
      'paymentId',
      'bookingId',
      'customerId',
      'providerId',
      'amount',
      'platformFee',
      'providerPayout',
      'status',
      'paymentMethod',
      'paidAt',
      'createdAt',
    ];
    return {
      title: 'ServEase Revenue Report',
      headers,
      rows: payments.map((payment) => [
        payment.id,
        payment.bookingId,
        payment.customerId ?? '',
        payment.providerId ?? '',
        String(payment.amount),
        String(payment.platformFee),
        String(payment.providerPayout),
        payment.status,
        payment.paymentMethod ?? '',
        payment.paidAt ?? '',
        payment.createdAt ?? '',
      ]),
    };
  }

  private toRevenueCsv(payments: PaymentSummary[]): string {
    const dataset = this.revenueDataset(payments);
    return this.toCsv(dataset.headers, dataset.rows);
  }

  private usersDataset(users: AdminUserSummary[]): AdminReportDataset {
    const headers = [
      'userId',
      'email',
      'fullName',
      'contactNumber',
      'role',
      'status',
      'createdAt',
    ];
    return {
      title: 'ServEase User Report',
      headers,
      rows: users.map((user) => [
        user.id,
        user.email,
        user.fullName ?? '',
        user.contactNumber ?? '',
        user.role,
        user.status,
        user.createdAt ?? '',
      ]),
    };
  }

  private toUsersCsv(users: AdminUserSummary[]): string {
    const dataset = this.usersDataset(users);
    return this.toCsv(dataset.headers, dataset.rows);
  }

  private financialDataset(
    payments: PaymentSummary[],
    payouts: PayoutSummary[],
    refunds: RefundSummary[],
  ): AdminReportDataset {
    const headers = [
      'recordType',
      'id',
      'relatedId',
      'partyId',
      'amount',
      'fee',
      'net',
      'status',
      'reference',
      'occurredAt',
    ];
    const rows: string[][] = [];

    for (const payment of payments) {
      rows.push([
        'payment',
        payment.id,
        payment.bookingId,
        payment.customerId ?? payment.providerId ?? '',
        String(payment.amount),
        String(payment.platformFee),
        String(payment.providerPayout),
        payment.status,
        payment.paymentMethod ?? '',
        payment.paidAt ?? payment.createdAt ?? '',
      ]);
    }

    for (const payout of payouts) {
      rows.push([
        'payout',
        payout.id,
        payout.reference ?? '',
        payout.providerId,
        String(payout.amount),
        String(payout.processingFee),
        String(payout.netAmount),
        payout.status,
        payout.methodType ?? '',
        payout.paidAt ?? payout.requestedAt ?? payout.createdAt ?? '',
      ]);
    }

    for (const refund of refunds) {
      rows.push([
        'refund',
        refund.id,
        refund.paymentId,
        refund.customerId ?? refund.providerId ?? '',
        String(refund.amount),
        '0',
        String(refund.amount),
        refund.status,
        refund.reason,
        refund.processedAt ?? refund.decidedAt ?? refund.requestedAt ?? '',
      ]);
    }

    return {
      title: 'ServEase Financial Report',
      headers,
      rows,
    };
  }

  private toFinancialCsv(
    payments: PaymentSummary[],
    payouts: PayoutSummary[],
    refunds: RefundSummary[],
  ): string {
    const dataset = this.financialDataset(payments, payouts, refunds);
    return this.toCsv(dataset.headers, dataset.rows);
  }

  private toCsv(headers: string[], rows: string[][]): string {
    return [headers, ...rows]
      .map((row) => row.map((value) => this.escapeCsv(value)).join(','))
      .join('\n');
  }

  private escapeCsv(value: string): string {
    if (/[",\n\r]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private toPdf(dataset: AdminReportDataset): string {
    const lines = [
      dataset.title,
      `Generated at ${new Date().toISOString()}`,
      `Rows: ${dataset.rows.length}`,
      '',
      dataset.headers.join(' | '),
      ...dataset.rows.slice(0, 40).map((row) => row.join(' | ')),
    ];
    const textCommands = lines
      .map((line, index) =>
        index === 0
          ? `(${this.escapePdfText(line)}) Tj`
          : `0 -16 Td (${this.escapePdfText(line)}) Tj`,
      )
      .join('\n');
    const stream = `BT\n/F1 10 Tf\n50 790 Td\n${textCommands}\nET`;
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`,
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    objects.forEach((object, index) => {
      offsets.push(Buffer.byteLength(pdf, 'utf8'));
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let index = 1; index < offsets.length; index += 1) {
      pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
    pdf += `startxref\n${xrefOffset}\n%%EOF`;
    return pdf;
  }

  private escapePdfText(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  private titleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
