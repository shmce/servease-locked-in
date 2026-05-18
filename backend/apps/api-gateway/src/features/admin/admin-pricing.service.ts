import { Injectable } from '@nestjs/common';
import {
  CreatePricingFuelIndexRequest,
  PricingCategoryRuleSummary,
  PricingFuelIndexSummary,
  PricingQuoteAuditSummary,
  UpsertPricingCategoryRuleRequest,
} from './admin-payment.types';
import { AdminServiceClient } from './clients/admin-service.client';

@Injectable()
export class AdminPricingGatewayService {
  constructor(private readonly adminServiceClient: AdminServiceClient) {}

  listRules(): Promise<PricingCategoryRuleSummary[]> {
    return this.adminServiceClient.listPricingRules();
  }

  upsertRule(
    input: UpsertPricingCategoryRuleRequest,
  ): Promise<PricingCategoryRuleSummary> {
    return this.adminServiceClient.upsertPricingRule(input);
  }

  listFuelIndex(): Promise<PricingFuelIndexSummary[]> {
    return this.adminServiceClient.listPricingFuelIndex();
  }

  createFuelIndex(
    input: CreatePricingFuelIndexRequest,
  ): Promise<PricingFuelIndexSummary> {
    return this.adminServiceClient.createPricingFuelIndex(input);
  }

  listQuoteAudits(): Promise<PricingQuoteAuditSummary[]> {
    return this.adminServiceClient.listPricingQuoteAudits();
  }
}
