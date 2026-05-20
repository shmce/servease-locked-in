import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AdminAuditLogSummary,
  CreateAdminAuditLogInput,
  ListAdminAuditLogsFilter,
} from '../admin-audit.types';
import {
  AdminBookingMessage,
  AdminBookingSummary,
  AdminBookingsSummaryStats,
  AdminOperationsAlerts,
  AppendAdminBookingMessageRequest,
  CancelAdminBookingRequest,
  EscalateAdminBookingRequest,
  ListAdminBookingsFilter,
} from '../admin-booking.types';
import {
  AdminBroadcastSummary,
  CreateAdminBroadcastRequest,
} from '../admin-broadcast.types';
import {
  AdminCategoryItem,
  AdminProviderSummary,
  AdminServiceItem,
  UpsertCategoryRequest,
  UpsertServiceRequest,
} from '../admin-catalog.types';
import { AdminDisputeSummary } from '../admin-dispute.types';
import {
  AdminProviderApplicationDocumentSummary,
  AdminProviderApplicationReview,
  AdminProviderApplicationSummary,
  ListProviderApplicationsFilter,
  UpdateProviderApplicationReviewInput,
} from '../admin-provider-application.types';
import {
  AdminDependencyUnavailableError,
  AdminServiceRequestError,
} from '../admin-support.errors';
import {
  PaymentSummary,
  CreatePricingFuelIndexRequest,
  CommissionRuleSummary,
  PricingCategoryRuleSummary,
  PricingFuelIndexSummary,
  PricingQuoteAuditSummary,
  PromotionSummary,
  PayoutEventSummary,
  PayoutSummary,
  RefundSummary,
  RecordPayoutEventRequest,
  SyncPricingFuelIndexRequest,
  UpsertPricingCategoryRuleRequest,
  UpsertPromotionRequest,
  UpdateCommissionRuleRequest,
} from '../admin-payment.types';
import { SupportTicketReplySummary, SupportTicketSummary } from '../admin-support.types';
import {
  AdminUserSummary,
  AdminUsersSummaryStats,
  CreateAdminUserRequest,
  UpdateAdminUserAccessRequest,
} from '../admin-users.types';
import {
  AdminIntegrationSummary,
  UpdateAdminIntegrationCredentialsInput,
  RecordAdminIntegrationTestInput,
} from '../admin-integration.types';
import {
  CreateAdminReportScheduleInput,
  ScheduledAdminReportResponse,
} from '../admin-report.types';

@Injectable()
export class AdminServiceClient {
  constructor(private readonly configService: ConfigService) {}

  listSupportTickets(status?: string | null): Promise<SupportTicketSummary[]> {
    const searchParams = new URLSearchParams();
    if (status) {
      searchParams.set('status', status);
    }
    return this.request<SupportTicketSummary[]>(
      `/internal/admin/support/tickets?${searchParams.toString()}`,
      'GET',
    );
  }

  getSupportTicket(ticketId: string): Promise<SupportTicketSummary> {
    return this.request<SupportTicketSummary>(
      `/internal/admin/support/tickets/${ticketId}`,
      'GET',
    );
  }

  updateTicketStatus(ticketId: string, status: string): Promise<SupportTicketSummary> {
    return this.request<SupportTicketSummary>(
      `/internal/admin/support/tickets/${ticketId}/status`,
      'PATCH',
      { status },
    );
  }

  listSupportTicketReplies(ticketId: string): Promise<SupportTicketReplySummary[]> {
    return this.request<SupportTicketReplySummary[]>(
      `/internal/admin/support/tickets/${ticketId}/replies`,
      'GET',
    );
  }

  addSupportTicketReply(ticketId: string, repliedBy: string, message: string): Promise<SupportTicketReplySummary> {
    return this.request<SupportTicketReplySummary>(
      `/internal/admin/support/tickets/${ticketId}/replies`,
      'POST',
      { repliedBy, message },
    );
  }

  assignSupportTicket(ticketId: string, assigneeId: string | null): Promise<SupportTicketSummary> {
    return this.request<SupportTicketSummary>(
      `/internal/admin/support/tickets/${ticketId}/assignee`,
      'PATCH',
      { assigneeId },
    );
  }

  getAdminUsersSummary(): Promise<AdminUsersSummaryStats> {
    return this.request<AdminUsersSummaryStats>('/internal/admin/users/summary', 'GET');
  }

  listAdminUsers(role?: string | null, status?: string | null, query?: string | null): Promise<AdminUserSummary[]> {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    if (query) params.set('query', query);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<AdminUserSummary[]>(`/internal/admin/users${qs}`, 'GET');
  }

  updateAdminUserStatus(userId: string, status: string): Promise<AdminUserSummary> {
    return this.request<AdminUserSummary>(
      `/internal/admin/users/${encodeURIComponent(userId)}/status`,
      'PATCH',
      { status },
    );
  }

  createAdminUser(input: CreateAdminUserRequest): Promise<AdminUserSummary> {
    return this.request<AdminUserSummary>('/internal/admin/users', 'POST', input);
  }

  updateAdminUserAccess(
    userId: string,
    input: UpdateAdminUserAccessRequest,
  ): Promise<AdminUserSummary> {
    return this.request<AdminUserSummary>(
      `/internal/admin/users/${encodeURIComponent(userId)}/access`,
      'PATCH',
      input,
    );
  }

  deleteAdminUser(userId: string): Promise<AdminUserSummary> {
    return this.request<AdminUserSummary>(
      `/internal/admin/users/${encodeURIComponent(userId)}`,
      'DELETE',
    );
  }

  listAdminCategories(): Promise<AdminCategoryItem[]> {
    return this.request<AdminCategoryItem[]>('/internal/admin/catalog/categories', 'GET');
  }

  createAdminCategory(req: UpsertCategoryRequest): Promise<AdminCategoryItem> {
    return this.request<AdminCategoryItem>('/internal/admin/catalog/categories', 'POST', req);
  }

  updateAdminCategory(categoryId: string, req: UpsertCategoryRequest): Promise<AdminCategoryItem> {
    return this.request<AdminCategoryItem>(
      `/internal/admin/catalog/categories/${encodeURIComponent(categoryId)}`,
      'PATCH',
      req,
    );
  }

  deleteAdminCategory(categoryId: string): Promise<void> {
    return this.request<void>(
      `/internal/admin/catalog/categories/${encodeURIComponent(categoryId)}`,
      'DELETE',
    );
  }

  listAdminServices(categoryId?: string | null): Promise<AdminServiceItem[]> {
    const qs = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
    return this.request<AdminServiceItem[]>(`/internal/admin/catalog/services${qs}`, 'GET');
  }

  createAdminService(req: UpsertServiceRequest): Promise<AdminServiceItem> {
    return this.request<AdminServiceItem>('/internal/admin/catalog/services', 'POST', req);
  }

  updateAdminService(serviceId: string, req: UpsertServiceRequest): Promise<AdminServiceItem> {
    return this.request<AdminServiceItem>(
      `/internal/admin/catalog/services/${encodeURIComponent(serviceId)}`,
      'PATCH',
      req,
    );
  }

  deleteAdminService(serviceId: string): Promise<void> {
    return this.request<void>(
      `/internal/admin/catalog/services/${encodeURIComponent(serviceId)}`,
      'DELETE',
    );
  }

  listAdminProviders(status?: string | null, query?: string | null): Promise<AdminProviderSummary[]> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (query) params.set('query', query);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<AdminProviderSummary[]>(`/internal/admin/catalog/providers${qs}`, 'GET');
  }

  getAdminProvider(providerId: string): Promise<AdminProviderSummary> {
    return this.request<AdminProviderSummary>(
      `/internal/admin/catalog/providers/${encodeURIComponent(providerId)}`,
      'GET',
    );
  }

  updateAdminProviderStatus(
    providerId: string,
    status: string,
    reason?: string | null,
  ): Promise<AdminProviderSummary> {
    return this.request<AdminProviderSummary>(
      `/internal/admin/catalog/providers/${encodeURIComponent(providerId)}/status`,
      'PATCH',
      { status, reason },
    );
  }

  listPayments(status?: string | null): Promise<PaymentSummary[]> {
    const searchParams = new URLSearchParams();
    if (status) {
      searchParams.set('status', status);
    }
    return this.request<PaymentSummary[]>(
      `/internal/admin/payments?${searchParams.toString()}`,
      'GET',
    );
  }

  getPayment(paymentId: string): Promise<PaymentSummary> {
    return this.request<PaymentSummary>(
      `/internal/admin/payments/${paymentId}`,
      'GET',
    );
  }

  updatePaymentStatus(
    paymentId: string,
    status: string,
  ): Promise<PaymentSummary> {
    return this.request<PaymentSummary>(
      `/internal/admin/payments/${paymentId}/status`,
      'PATCH',
      {
        status,
      },
    );
  }

  recordPaymentFailure(
    paymentId: string,
    failureReason: string,
    failureCode: string | null,
    disputeId: string | null,
  ): Promise<PaymentSummary> {
    return this.request<PaymentSummary>(
      `/internal/admin/payments/${paymentId}/failure`,
      'POST',
      { failureReason, failureCode, disputeId },
    );
  }

  retryPayment(paymentId: string): Promise<PaymentSummary> {
    return this.request<PaymentSummary>(
      `/internal/admin/payments/${paymentId}/retry`,
      'POST',
    );
  }

  syncPaymentWithApicenter(paymentId: string): Promise<PaymentSummary> {
    return this.request<PaymentSummary>(
      `/internal/admin/payments/${paymentId}/apicenter-sync`,
      'POST',
    );
  }

  listPromotions(status?: string | null): Promise<PromotionSummary[]> {
    const searchParams = new URLSearchParams();
    if (status) {
      searchParams.set('status', status);
    }
    return this.request<PromotionSummary[]>(
      `/internal/admin/promotions?${searchParams.toString()}`,
      'GET',
    );
  }

  createPromotion(input: UpsertPromotionRequest): Promise<PromotionSummary> {
    return this.request<PromotionSummary>(
      '/internal/admin/promotions',
      'POST',
      input,
    );
  }

  updatePromotion(
    promotionId: string,
    input: UpsertPromotionRequest,
  ): Promise<PromotionSummary> {
    return this.request<PromotionSummary>(
      `/internal/admin/promotions/${promotionId}`,
      'PATCH',
      input,
    );
  }

  deletePromotion(promotionId: string): Promise<PromotionSummary> {
    return this.request<PromotionSummary>(
      `/internal/admin/promotions/${promotionId}`,
      'DELETE',
    );
  }

  listPayouts(status?: string | null): Promise<PayoutSummary[]> {
    const searchParams = new URLSearchParams();
    if (status) {
      searchParams.set('status', status);
    }
    return this.request<PayoutSummary[]>(
      `/internal/admin/payments/payouts?${searchParams.toString()}`,
      'GET',
    );
  }

  updatePayoutStatus(
    payoutId: string,
    status: string,
  ): Promise<PayoutSummary> {
    return this.request<PayoutSummary>(
      `/internal/admin/payments/payouts/${payoutId}/status`,
      'PATCH',
      {
        status,
      },
    );
  }

  releasePaymentToProvider(
    paymentId: string,
    adminUserId: string,
    note?: string | null,
  ): Promise<PayoutSummary> {
    return this.request<PayoutSummary>(
      `/internal/admin/payments/${paymentId}/release`,
      'POST',
      {
        adminUserId,
        note: note ?? null,
      },
    );
  }

  listPayoutEvents(payoutId: string): Promise<PayoutEventSummary[]> {
    return this.request<PayoutEventSummary[]>(
      `/internal/admin/payments/payouts/${payoutId}/events`,
      'GET',
    );
  }

  recordPayoutEvent(
    payoutId: string,
    input: RecordPayoutEventRequest,
  ): Promise<PayoutEventSummary> {
    return this.request<PayoutEventSummary>(
      `/internal/admin/payments/payouts/${payoutId}/events`,
      'POST',
      input,
    );
  }

  listBroadcasts(limit?: number | null): Promise<AdminBroadcastSummary[]> {
    const searchParams = new URLSearchParams();
    if (limit) {
      searchParams.set('limit', String(limit));
    }
    return this.request<AdminBroadcastSummary[]>(
      `/internal/admin/broadcasts?${searchParams.toString()}`,
      'GET',
    );
  }

  createBroadcast(
    input: CreateAdminBroadcastRequest & {
      adminUserId: string;
      status: 'scheduled' | 'sent' | 'failed';
      deliveredCount: number;
      failedCount: number;
    },
  ): Promise<AdminBroadcastSummary> {
    return this.request<AdminBroadcastSummary>(
      '/internal/admin/broadcasts',
      'POST',
      input,
    );
  }

  listRefunds(status?: string | null): Promise<RefundSummary[]> {
    const searchParams = new URLSearchParams();
    if (status) {
      searchParams.set('status', status);
    }
    return this.request<RefundSummary[]>(
      `/internal/admin/payments/refunds?${searchParams.toString()}`,
      'GET',
    );
  }

  approveRefund(
    refundId: string,
    adminUserId: string,
    reason?: string | null,
  ): Promise<RefundSummary> {
    return this.request<RefundSummary>(
      `/internal/admin/payments/refunds/${refundId}/approve`,
      'POST',
      {
        adminUserId,
        reason: reason ?? null,
      },
    );
  }

  rejectRefund(
    refundId: string,
    adminUserId: string,
    reason: string,
  ): Promise<RefundSummary> {
    return this.request<RefundSummary>(
      `/internal/admin/payments/refunds/${refundId}/reject`,
      'POST',
      {
        adminUserId,
        reason,
      },
    );
  }

  listCommissionRules(): Promise<CommissionRuleSummary[]> {
    return this.request<CommissionRuleSummary[]>(
      '/internal/admin/payments/commission-rules',
      'GET',
    );
  }

  updateCommissionRule(
    ruleId: string,
    input: UpdateCommissionRuleRequest,
  ): Promise<CommissionRuleSummary> {
    return this.request<CommissionRuleSummary>(
      `/internal/admin/payments/commission-rules/${ruleId}`,
      'PATCH',
      input,
    );
  }

  listPricingRules(): Promise<PricingCategoryRuleSummary[]> {
    return this.request<PricingCategoryRuleSummary[]>(
      '/internal/admin/pricing/rules',
      'GET',
    );
  }

  upsertPricingRule(
    input: UpsertPricingCategoryRuleRequest,
  ): Promise<PricingCategoryRuleSummary> {
    return this.request<PricingCategoryRuleSummary>(
      '/internal/admin/pricing/rules',
      'PUT',
      input,
    );
  }

  listPricingFuelIndex(): Promise<PricingFuelIndexSummary[]> {
    return this.request<PricingFuelIndexSummary[]>(
      '/internal/admin/pricing/fuel-index',
      'GET',
    );
  }

  createPricingFuelIndex(
    input: CreatePricingFuelIndexRequest,
  ): Promise<PricingFuelIndexSummary> {
    return this.request<PricingFuelIndexSummary>(
      '/internal/admin/pricing/fuel-index',
      'POST',
      input,
    );
  }

  syncPricingFuelIndexFromGasWatch(
    input: SyncPricingFuelIndexRequest,
  ): Promise<PricingFuelIndexSummary> {
    return this.request<PricingFuelIndexSummary>(
      '/internal/admin/pricing/fuel-index/sync',
      'POST',
      input,
    );
  }

  listPricingQuoteAudits(): Promise<PricingQuoteAuditSummary[]> {
    return this.request<PricingQuoteAuditSummary[]>(
      '/internal/admin/pricing/quote-audits',
      'GET',
    );
  }

  listDisputes(status?: string | null): Promise<AdminDisputeSummary[]> {
    const searchParams = new URLSearchParams();
    if (status) {
      searchParams.set('status', status);
    }
    return this.request<AdminDisputeSummary[]>(
      `/internal/admin/disputes?${searchParams.toString()}`,
      'GET',
    );
  }

  getDispute(disputeId: string): Promise<AdminDisputeSummary> {
    return this.request<AdminDisputeSummary>(
      `/internal/admin/disputes/${disputeId}`,
      'GET',
    );
  }

  resolveDispute(disputeId: string): Promise<AdminDisputeSummary> {
    return this.request<AdminDisputeSummary>(
      `/internal/admin/disputes/${disputeId}/resolve`,
      'POST',
    );
  }

  listAuditLogs(
    filter: ListAdminAuditLogsFilter,
  ): Promise<AdminAuditLogSummary[]> {
    const searchParams = new URLSearchParams();
    if (filter.adminUserId) {
      searchParams.set('adminUserId', filter.adminUserId);
    }
    if (filter.actionType) {
      searchParams.set('actionType', filter.actionType);
    }
    if (filter.entityType) {
      searchParams.set('entityType', filter.entityType);
    }
    if (filter.query) {
      searchParams.set('query', filter.query);
    }
    if (filter.from) {
      searchParams.set('from', filter.from);
    }
    if (filter.to) {
      searchParams.set('to', filter.to);
    }
    if (filter.limit) {
      searchParams.set('limit', String(filter.limit));
    }

    return this.request<AdminAuditLogSummary[]>(
      `/internal/admin/audit-logs?${searchParams.toString()}`,
      'GET',
    );
  }

  createAuditLog(
    input: CreateAdminAuditLogInput,
  ): Promise<AdminAuditLogSummary> {
    return this.request<AdminAuditLogSummary>(
      '/internal/admin/audit-logs',
      'POST',
      input,
    );
  }

  getOperationsAlerts(): Promise<AdminOperationsAlerts> {
    return this.request<AdminOperationsAlerts>(
      '/internal/admin/bookings/operations/alerts',
      'GET',
    );
  }

  getBookingsSummary(): Promise<AdminBookingsSummaryStats> {
    return this.request<AdminBookingsSummaryStats>(
      '/internal/admin/bookings/summary',
      'GET',
    );
  }

  listBookings(
    filter: ListAdminBookingsFilter,
  ): Promise<AdminBookingSummary[]> {
    const searchParams = new URLSearchParams();
    if (filter.status) {
      searchParams.set('status', filter.status);
    }
    if (filter.query) {
      searchParams.set('query', filter.query);
    }
    if (filter.limit) {
      searchParams.set('limit', String(filter.limit));
    }

    return this.request<AdminBookingSummary[]>(
      `/internal/admin/bookings?${searchParams.toString()}`,
      'GET',
    );
  }

  getBooking(bookingId: string): Promise<AdminBookingSummary> {
    return this.request<AdminBookingSummary>(
      `/internal/admin/bookings/${bookingId}`,
      'GET',
    );
  }

  cancelBooking(
    bookingId: string,
    input: CancelAdminBookingRequest & { adminUserId: string },
  ): Promise<AdminBookingSummary> {
    return this.request<AdminBookingSummary>(
      `/internal/admin/bookings/${bookingId}/cancel`,
      'POST',
      input,
    );
  }

  escalateBooking(
    bookingId: string,
    input: EscalateAdminBookingRequest & { adminUserId: string },
  ): Promise<AdminBookingSummary> {
    return this.request<AdminBookingSummary>(
      `/internal/admin/bookings/${bookingId}/escalate`,
      'POST',
      input,
    );
  }

  listBookingMessages(bookingId: string): Promise<AdminBookingMessage[]> {
    return this.request<AdminBookingMessage[]>(
      `/internal/admin/bookings/${bookingId}/messages`,
      'GET',
    );
  }

  appendBookingMessage(
    bookingId: string,
    input: AppendAdminBookingMessageRequest,
  ): Promise<AdminBookingMessage> {
    return this.request<AdminBookingMessage>(
      `/internal/admin/bookings/${bookingId}/messages`,
      'POST',
      input,
    );
  }

  listProviderApplications(
    filter: ListProviderApplicationsFilter,
  ): Promise<AdminProviderApplicationSummary[]> {
    const searchParams = new URLSearchParams();
    if (filter.status) {
      searchParams.set('status', filter.status);
    }
    if (filter.query) {
      searchParams.set('query', filter.query);
    }
    if (filter.limit) {
      searchParams.set('limit', String(filter.limit));
    }

    return this.request<AdminProviderApplicationSummary[]>(
      `/internal/admin/provider-applications?${searchParams.toString()}`,
      'GET',
    );
  }

  getProviderApplication(
    applicationId: string,
  ): Promise<AdminProviderApplicationSummary> {
    return this.request<AdminProviderApplicationSummary>(
      `/internal/admin/provider-applications/${applicationId}`,
      'GET',
    );
  }

  getProviderApplicationDocument(
    applicationId: string,
    documentId: string,
  ): Promise<AdminProviderApplicationDocumentSummary> {
    return this.request<AdminProviderApplicationDocumentSummary>(
      `/internal/admin/provider-applications/${applicationId}/documents/${documentId}`,
      'GET',
    );
  }

  getProviderApplicationReview(
    applicationId: string,
  ): Promise<AdminProviderApplicationReview> {
    return this.request<AdminProviderApplicationReview>(
      `/internal/admin/provider-applications/${applicationId}/review`,
      'GET',
    );
  }

  updateProviderApplicationReview(input: {
    applicationId: string;
    adminUserId: string;
  } & UpdateProviderApplicationReviewInput): Promise<AdminProviderApplicationReview> {
    return this.request<AdminProviderApplicationReview>(
      `/internal/admin/provider-applications/${input.applicationId}/review`,
      'PUT',
      input,
    );
  }

  addProviderApplicationReviewNote(input: {
    applicationId: string;
    adminUserId: string;
    note: string;
  }): Promise<AdminProviderApplicationReview> {
    return this.request<AdminProviderApplicationReview>(
      `/internal/admin/provider-applications/${input.applicationId}/review/notes`,
      'POST',
      {
        adminUserId: input.adminUserId,
        note: input.note,
      },
    );
  }

  decideProviderApplication(input: {
    applicationId: string;
    adminUserId: string;
    decision: 'approved' | 'rejected';
    reason: string;
  }): Promise<AdminProviderApplicationSummary> {
    return this.request<AdminProviderApplicationSummary>(
      `/internal/admin/provider-applications/${input.applicationId}/${input.decision === 'approved' ? 'approve' : 'reject'}`,
      'POST',
      {
        adminUserId: input.adminUserId,
        reason: input.reason,
      },
    );
  }

  listAdminIntegrations(): Promise<AdminIntegrationSummary[]> {
    return this.request<AdminIntegrationSummary[]>(
      '/internal/admin/integrations',
      'GET',
    );
  }

  updateAdminIntegrationCredentials(
    input: UpdateAdminIntegrationCredentialsInput,
  ): Promise<AdminIntegrationSummary> {
    return this.request<AdminIntegrationSummary>(
      `/internal/admin/integrations/${encodeURIComponent(input.provider)}/credentials`,
      'PATCH',
      {
        adminUserId: input.adminUserId,
        isEnabled: input.isEnabled,
        webhookUrl: input.webhookUrl,
        apiKeyPreview: input.apiKeyPreview,
      },
    );
  }

  testAdminIntegration(
    input: RecordAdminIntegrationTestInput,
  ): Promise<AdminIntegrationSummary> {
    return this.request<AdminIntegrationSummary>(
      `/internal/admin/integrations/${encodeURIComponent(input.provider)}/test`,
      'POST',
      {
        adminUserId: input.adminUserId,
        success: input.success,
        errorMessage: input.errorMessage,
      },
    );
  }

  listAdminReportSchedules(
    type?: string | null,
    limit?: number | null,
  ): Promise<ScheduledAdminReportResponse[]> {
    const searchParams = new URLSearchParams();
    if (type) {
      searchParams.set('type', type);
    }
    if (limit) {
      searchParams.set('limit', String(limit));
    }
    const query = searchParams.toString();
    return this.request<ScheduledAdminReportResponse[]>(
      `/internal/admin/reports/schedules${query ? `?${query}` : ''}`,
      'GET',
    );
  }

  createAdminReportSchedule(
    input: CreateAdminReportScheduleInput,
  ): Promise<ScheduledAdminReportResponse> {
    return this.request<ScheduledAdminReportResponse>(
      '/internal/admin/reports/schedules',
      'POST',
      input,
    );
  }

  private async request<T>(
    path: string,
    method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'ADMIN_SERVICE_URL',
      'http://localhost:8511',
    );
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          'content-type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new AdminDependencyUnavailableError();
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        error?: { code?: string; message?: string };
      };
      if (payload.error?.code || payload.error?.message || response.status < 500) {
        throw new AdminServiceRequestError(
          response.status,
          payload.error?.code ?? 'admin_request_failed',
          payload.error?.message ?? 'Admin request failed.',
        );
      }
      throw new AdminDependencyUnavailableError();
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
