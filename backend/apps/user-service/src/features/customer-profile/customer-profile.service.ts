import { Inject, Injectable } from '@nestjs/common';
import { CustomerProfileSummary } from './customer-profile.types';

export const CUSTOMER_PROFILE_REPOSITORY = Symbol('CUSTOMER_PROFILE_REPOSITORY');

export interface CustomerProfileRepository {
  findByUserId(userId: string): Promise<CustomerProfileSummary | null>;
}

@Injectable()
export class EmptyCustomerProfileRepository implements CustomerProfileRepository {
  async findByUserId(): Promise<CustomerProfileSummary | null> {
    return null;
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
}
