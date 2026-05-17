import {
  Controller,
  Get,
  Header,
  Headers,
  HttpCode,
  HttpException,
  Post,
} from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { AdminRequiredError } from './admin-support.errors';
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

const notImplemented = {
  error: {
    code: 'not_implemented',
    message: 'Report generation is not yet implemented.',
  },
};

@Controller('v1/admin/reports')
export class AdminReportController {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
    private readonly adminBookingGatewayService: AdminBookingGatewayService,
    private readonly adminPaymentGatewayService: AdminPaymentGatewayService,
    private readonly adminUsersGatewayService: AdminUsersGatewayService,
  ) {}

  @Get('revenue.pdf')
  @HttpCode(501)
  async revenuePdf(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ error: { code: string; message: string } }> {
    await this.requireAdmin(authorization).catch(() => {
      throw this.error('admin_required', 'An admin account is required.', 403);
    });
    return notImplemented;
  }

  @Get('revenue.csv')
  @Header('content-type', 'text/csv; charset=utf-8')
  @Header(
    'content-disposition',
    'attachment; filename="servease-revenue.csv"',
  )
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
      const users = await this.adminUsersGatewayService.listUsers(null, null, null);
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
  @Header(
    'content-disposition',
    'attachment; filename="servease-bookings.csv"',
  )
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

  @Post(':type')
  @HttpCode(501)
  async generate(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ error: { code: string; message: string } }> {
    await this.requireAdmin(authorization).catch(() => {
      throw this.error('admin_required', 'An admin account is required.', 403);
    });
    return notImplemented;
  }

  @Post(':type/schedules')
  @HttpCode(501)
  async schedule(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ error: { code: string; message: string } }> {
    await this.requireAdmin(authorization).catch(() => {
      throw this.error('admin_required', 'An admin account is required.', 403);
    });
    return notImplemented;
  }

  private async requireAdmin(authorization: string | undefined): Promise<void> {
    const userId = await this.authTokenService.authenticate(authorization);
    const currentUser = await this.currentUserService.getCurrentUser(userId);
    if (currentUser.user.role !== 'admin') {
      throw new AdminRequiredError();
    }
  }

  private handleExportError(error: unknown, fallback: string): HttpException {
    if (error instanceof AdminRequiredError) {
      return this.error('admin_required', 'An admin account is required.', 403);
    }
    return this.error('admin_dependency_unavailable', fallback, 503);
  }

  private toBookingsCsv(bookings: AdminBookingSummary[]): string {
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
    const rows = bookings.map((booking) => [
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
    ]);
    return this.toCsv(headers, rows);
  }

  private toRevenueCsv(payments: PaymentSummary[]): string {
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
    const rows = payments.map((payment) => [
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
    ]);
    return this.toCsv(headers, rows);
  }

  private toUsersCsv(users: AdminUserSummary[]): string {
    const headers = [
      'userId',
      'email',
      'fullName',
      'contactNumber',
      'role',
      'status',
      'createdAt',
    ];
    const rows = users.map((user) => [
      user.id,
      user.email,
      user.fullName ?? '',
      user.contactNumber ?? '',
      user.role,
      user.status,
      user.createdAt ?? '',
    ]);
    return this.toCsv(headers, rows);
  }

  private toFinancialCsv(
    payments: PaymentSummary[],
    payouts: PayoutSummary[],
    refunds: RefundSummary[],
  ): string {
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

    return this.toCsv(headers, rows);
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

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
