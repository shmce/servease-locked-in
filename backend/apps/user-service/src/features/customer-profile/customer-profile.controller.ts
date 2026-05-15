import { Body, Controller, Get, HttpException, Param, Patch, Post } from '@nestjs/common';
import { CustomerProfileService } from './customer-profile.service';
import {
  CreateCustomerProfileInput,
  CustomerProfileSummary,
} from './customer-profile.types';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Controller('internal/users')
export class CustomerProfileController {
  constructor(private readonly customerProfileService: CustomerProfileService) {}

  @Get(':userId/customer-profile')
  async show(@Param('userId') userId: string): Promise<{
    data: CustomerProfileSummary;
  }> {
    const data = await this.customerProfileService.findByUserId(userId);

    if (!data) {
      throw new HttpException(
        {
          error: {
            code: 'customer_profile_not_found',
            message: 'Customer profile was not found.',
            details: {},
          },
        },
        404,
      );
    }

    return { data };
  }

  @Post(':userId/customer-profile')
  async create(
    @Param('userId') userId: string,
    @Body() body: Omit<CreateCustomerProfileInput, 'userId'>,
  ): Promise<{ data: CustomerProfileSummary }> {
    if (!UUID_PATTERN.test(userId)) {
      throw new HttpException(
        {
          error: {
            code: 'invalid_customer_profile_request',
            message: 'Customer profile request is invalid.',
            details: {},
          },
        },
        400,
      );
    }

    try {
      return {
        data: await this.customerProfileService.create({
          userId,
          address: body.address ?? null,
        }),
      };
    } catch {
      throw new HttpException(
        {
          error: {
            code: 'customer_profile_dependency_unavailable',
            message: 'Customer profile creation failed.',
            details: {},
          },
        },
        503,
      );
    }
  }

  @Patch(':userId/customer-profile')
  async update(
    @Param('userId') userId: string,
    @Body() body: Omit<CreateCustomerProfileInput, 'userId'>,
  ): Promise<{ data: CustomerProfileSummary }> {
    if (!UUID_PATTERN.test(userId)) {
      throw new HttpException(
        {
          error: {
            code: 'invalid_customer_profile_request',
            message: 'Customer profile request is invalid.',
            details: {},
          },
        },
        400,
      );
    }

    try {
      return {
        data: await this.customerProfileService.update({
          userId,
          address: body.address ?? null,
        }),
      };
    } catch {
      throw new HttpException(
        {
          error: {
            code: 'customer_profile_dependency_unavailable',
            message: 'Customer profile update failed.',
            details: {},
          },
        },
        503,
      );
    }
  }
}
