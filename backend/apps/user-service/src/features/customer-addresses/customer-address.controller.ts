import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CustomerAddressService } from './customer-address.service';
import {
  CreateCustomerAddressInput,
  CustomerAddressSummary,
  UpdateCustomerAddressInput,
} from './customer-address.types';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Controller('internal/users/:userId/addresses')
export class CustomerAddressController {
  constructor(private readonly customerAddressService: CustomerAddressService) {}

  @Get()
  async index(
    @Param('userId') userId: string,
  ): Promise<{ data: CustomerAddressSummary[] }> {
    this.assertUuid(userId);
    try {
      return { data: await this.customerAddressService.listByUserId(userId) };
    } catch {
      throw this.dependencyError('Customer address lookup failed.');
    }
  }

  @Post()
  async create(
    @Param('userId') userId: string,
    @Body() body: Omit<CreateCustomerAddressInput, 'userId'>,
  ): Promise<{ data: CustomerAddressSummary }> {
    this.assertUuid(userId);
    this.assertBody(body);

    try {
      return {
        data: await this.customerAddressService.create({
          ...body,
          userId,
        }),
      };
    } catch {
      throw this.dependencyError('Customer address creation failed.');
    }
  }

  @Patch(':addressId')
  async update(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
    @Body() body: Omit<UpdateCustomerAddressInput, 'userId' | 'addressId'>,
  ): Promise<{ data: CustomerAddressSummary }> {
    this.assertUuid(userId);
    this.assertUuid(addressId);
    if (body.address !== undefined && !body.address?.trim()) {
      throw this.invalidRequest();
    }

    try {
      return {
        data: await this.customerAddressService.update({
          ...body,
          userId,
          addressId,
        }),
      };
    } catch {
      throw this.dependencyError('Customer address update failed.');
    }
  }

  @Post(':addressId/default')
  async setDefault(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
  ): Promise<{ data: CustomerAddressSummary }> {
    this.assertUuid(userId);
    this.assertUuid(addressId);

    try {
      return {
        data: await this.customerAddressService.setDefault(userId, addressId),
      };
    } catch {
      throw this.dependencyError('Default customer address update failed.');
    }
  }

  @Delete(':addressId')
  async delete(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
  ): Promise<{ data: { ok: true } }> {
    this.assertUuid(userId);
    this.assertUuid(addressId);

    try {
      return {
        data: await this.customerAddressService.delete(userId, addressId),
      };
    } catch {
      throw this.dependencyError('Customer address deletion failed.');
    }
  }

  private assertUuid(value: string): void {
    if (!UUID_PATTERN.test(value)) {
      throw this.invalidRequest();
    }
  }

  private assertBody(body: Omit<CreateCustomerAddressInput, 'userId'>): void {
    if (!body.address?.trim()) {
      throw this.invalidRequest();
    }
  }

  private invalidRequest(): HttpException {
    return new HttpException(
      {
        error: {
          code: 'invalid_customer_address_request',
          message: 'Customer address request is invalid.',
          details: {},
        },
      },
      400,
    );
  }

  private dependencyError(message: string): HttpException {
    return new HttpException(
      {
        error: {
          code: 'customer_address_dependency_unavailable',
          message,
          details: {},
        },
      },
      503,
    );
  }
}
