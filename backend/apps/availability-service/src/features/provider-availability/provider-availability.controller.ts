import { Body, Controller, Delete, Get, HttpException, Param, Post, Put } from '@nestjs/common';
import {
  InvalidAvailabilityRequestError,
  TimeOffConflictsBookingError,
  TimeOffTooSoonError,
} from './provider-availability.errors';
import { ProviderAvailabilityService } from './provider-availability.service';
import {
  AddProviderTimeOffWindowInput,
  AvailabilityWindowInput,
  ProviderAvailabilitySchedule,
} from './provider-availability.types';

@Controller('internal/providers/:providerId/availability')
export class ProviderAvailabilityController {
  constructor(private readonly availabilityService: ProviderAvailabilityService) {}

  @Get()
  async show(
    @Param('providerId') providerId: string,
  ): Promise<{ data: ProviderAvailabilitySchedule }> {
    try {
      return {
        data: await this.availabilityService.getSchedule(providerId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Put('windows')
  async replaceWindows(
    @Param('providerId') providerId: string,
    @Body() body: { windows: AvailabilityWindowInput[] },
  ): Promise<{ data: ProviderAvailabilitySchedule }> {
    try {
      return {
        data: await this.availabilityService.replaceWindows(
          providerId,
          body.windows,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('days-off')
  async addDayOff(
    @Param('providerId') providerId: string,
    @Body() body: { offDate: string; reason?: string | null },
  ): Promise<{ data: ProviderAvailabilitySchedule }> {
    try {
      return {
        data: await this.availabilityService.addDayOff(
          providerId,
          body.offDate,
          body.reason,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete('days-off/:offDate')
  async removeDayOff(
    @Param('providerId') providerId: string,
    @Param('offDate') offDate: string,
  ): Promise<{ data: ProviderAvailabilitySchedule }> {
    try {
      return {
        data: await this.availabilityService.removeDayOff(providerId, offDate),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('time-off')
  async addTimeOff(
    @Param('providerId') providerId: string,
    @Body() body: AddProviderTimeOffWindowInput,
  ): Promise<{ data: ProviderAvailabilitySchedule }> {
    try {
      return {
        data: await this.availabilityService.addTimeOffWindow(providerId, body),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete('time-off/:id')
  async removeTimeOff(
    @Param('providerId') providerId: string,
    @Param('id') id: string,
  ): Promise<{ data: ProviderAvailabilitySchedule }> {
    try {
      return {
        data: await this.availabilityService.removeTimeOffWindow(providerId, id),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidAvailabilityRequestError) {
      return this.error(
        'invalid_availability_request',
        'Availability request is invalid.',
        400,
      );
    }

    if (error instanceof TimeOffTooSoonError) {
      return this.error(
        'time_off_too_soon',
        'Provider time off must be at least 2 days from today.',
        422,
      );
    }

    if (error instanceof TimeOffConflictsBookingError) {
      return this.error(
        'time_off_conflicts_booking',
        'Provider time off conflicts with an active booking.',
        409,
      );
    }

    return this.error(
      'availability_dependency_unavailable',
      'Availability service failed.',
      503,
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException(
      {
        error: {
          code,
          message,
          details: {},
        },
      },
      status,
    );
  }
}
