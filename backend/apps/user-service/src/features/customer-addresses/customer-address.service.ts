import { Inject, Injectable } from '@nestjs/common';
import {
  CreateCustomerAddressInput,
  CustomerAddressSummary,
  UpdateCustomerAddressInput,
} from './customer-address.types';

export const CUSTOMER_ADDRESS_REPOSITORY = Symbol('CUSTOMER_ADDRESS_REPOSITORY');

export interface CustomerAddressRepository {
  listByUserId(userId: string): Promise<CustomerAddressSummary[]>;
  create(input: CreateCustomerAddressInput): Promise<CustomerAddressSummary>;
  update(input: UpdateCustomerAddressInput): Promise<CustomerAddressSummary>;
  setDefault(userId: string, addressId: string): Promise<CustomerAddressSummary>;
  delete(userId: string, addressId: string): Promise<{ ok: true }>;
}

@Injectable()
export class EmptyCustomerAddressRepository implements CustomerAddressRepository {
  async listByUserId(): Promise<CustomerAddressSummary[]> {
    return [];
  }

  async create(): Promise<CustomerAddressSummary> {
    throw new Error('customer_address_repository_not_configured');
  }

  async update(): Promise<CustomerAddressSummary> {
    throw new Error('customer_address_repository_not_configured');
  }

  async setDefault(): Promise<CustomerAddressSummary> {
    throw new Error('customer_address_repository_not_configured');
  }

  async delete(): Promise<{ ok: true }> {
    throw new Error('customer_address_repository_not_configured');
  }
}

@Injectable()
export class CustomerAddressService {
  constructor(
    @Inject(CUSTOMER_ADDRESS_REPOSITORY)
    private readonly customerAddressRepository: CustomerAddressRepository,
  ) {}

  async listByUserId(userId: string): Promise<CustomerAddressSummary[]> {
    return this.customerAddressRepository.listByUserId(userId);
  }

  async create(input: CreateCustomerAddressInput): Promise<CustomerAddressSummary> {
    return this.customerAddressRepository.create(input);
  }

  async update(input: UpdateCustomerAddressInput): Promise<CustomerAddressSummary> {
    return this.customerAddressRepository.update(input);
  }

  async setDefault(
    userId: string,
    addressId: string,
  ): Promise<CustomerAddressSummary> {
    return this.customerAddressRepository.setDefault(userId, addressId);
  }

  async delete(userId: string, addressId: string): Promise<{ ok: true }> {
    return this.customerAddressRepository.delete(userId, addressId);
  }
}
