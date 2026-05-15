import { Controller, Get, HttpException, Param } from '@nestjs/common';
import { CustomerProfileService } from './customer-profile.service';
import { CustomerProfileSummary } from './customer-profile.types';

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
}
