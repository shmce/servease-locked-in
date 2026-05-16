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
      if (error instanceof AdminRequiredError) {
        throw this.error('admin_required', 'An admin account is required.', 403);
      }
      throw this.error(
        'admin_dependency_unavailable',
        'Booking report export failed.',
        503,
      );
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
