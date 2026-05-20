import { Injectable } from '@nestjs/common';
import {
  CreatePricingFuelIndexRequest,
  PricingCategoryRuleSummary,
  PricingFuelIndexSummary,
  PricingQuoteAuditSummary,
  SyncPricingFuelIndexRequest,
  UpsertPricingCategoryRuleRequest,
} from './admin-payment.types';
import { PaymentServiceClient } from './clients/payment-service.client';

@Injectable()
export class AdminPricingService {
  constructor(private readonly paymentServiceClient: PaymentServiceClient) {}

  listRules(): Promise<PricingCategoryRuleSummary[]> {
    return this.paymentServiceClient.listPricingRules();
  }

  upsertRule(
    input: UpsertPricingCategoryRuleRequest,
  ): Promise<PricingCategoryRuleSummary> {
    return this.paymentServiceClient.upsertPricingRule(input);
  }

  listFuelIndex(): Promise<PricingFuelIndexSummary[]> {
    return this.paymentServiceClient.listPricingFuelIndex();
  }

  createFuelIndex(
    input: CreatePricingFuelIndexRequest,
  ): Promise<PricingFuelIndexSummary> {
    return this.paymentServiceClient.createPricingFuelIndex(input);
  }

  syncFuelIndexFromGasWatch(
    input: SyncPricingFuelIndexRequest,
  ): Promise<PricingFuelIndexSummary> {
    return this.paymentServiceClient.syncPricingFuelIndexFromGasWatch(input);
  }

  listQuoteAudits(): Promise<PricingQuoteAuditSummary[]> {
    return this.paymentServiceClient.listPricingQuoteAudits();
  }
}
