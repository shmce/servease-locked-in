import { Inject, Injectable } from '@nestjs/common';
import {
  CreateCustomerProfileInput,
  CustomerProfileSummary,
  UpdateCustomerProfileInput,
} from './customer-profile.types';

export const CUSTOMER_PROFILE_REPOSITORY = Symbol('CUSTOMER_PROFILE_REPOSITORY');

export interface CustomerProfileRepository {
  findByUserId(userId: string): Promise<CustomerProfileSummary | null>;
  create(input: CreateCustomerProfileInput): Promise<CustomerProfileSummary>;
  update(input: UpdateCustomerProfileInput): Promise<CustomerProfileSummary>;
}

@Injectable()
export class EmptyCustomerProfileRepository implements CustomerProfileRepository {
  async findByUserId(): Promise<CustomerProfileSummary | null> {
    return null;
  }

  async create(): Promise<CustomerProfileSummary> {
    throw new Error('customer_profile_repository_not_configured');
  }

  async update(): Promise<CustomerProfileSummary> {
    throw new Error('customer_profile_repository_not_configured');
  }
}

@Injectable()
export class CustomerProfileService {
  constructor(
    @Inject(CUSTOMER_PROFILE_REPOSITORY)
    private readonly customerProfileRepository: CustomerProfileRepository,
  ) {}

  async findByUserId(userId: string): Promise<CustomerProfileSummary | null> {
    return this.customerProfileRepository.findByUserId(userId);
  }

  async create(input: CreateCustomerProfileInput): Promise<CustomerProfileSummary> {
    return this.customerProfileRepository.create(input);
  }

  async update(input: UpdateCustomerProfileInput): Promise<CustomerProfileSummary> {
    return this.customerProfileRepository.update(input);
  }
}
