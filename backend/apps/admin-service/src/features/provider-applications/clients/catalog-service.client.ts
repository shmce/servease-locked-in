import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AdminProviderApplicationDocumentSummary,
  AdminProviderApplicationSummary,
  ListProviderApplicationsFilter,
} from '../admin-provider-application.types';

@Injectable()
export class CatalogServiceClient {
  constructor(private readonly configService: ConfigService) {}

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
      `/internal/providers/applications?${searchParams.toString()}`,
      'GET',
    );
  }

  getProviderApplication(
    applicationId: string,
  ): Promise<AdminProviderApplicationSummary> {
    return this.request<AdminProviderApplicationSummary>(
      `/internal/providers/applications/${applicationId}`,
      'GET',
    );
  }

  getProviderApplicationDocument(
    applicationId: string,
    documentId: string,
  ): Promise<AdminProviderApplicationDocumentSummary> {
    return this.request<AdminProviderApplicationDocumentSummary>(
      `/internal/providers/applications/${applicationId}/documents/${documentId}`,
      'GET',
    );
  }

  decideProviderApplication(input: {
    applicationId: string;
    adminUserId: string;
    decision: 'approved' | 'rejected';
    reason: string;
  }): Promise<AdminProviderApplicationSummary> {
    return this.request<AdminProviderApplicationSummary>(
      `/internal/providers/applications/${input.applicationId}/decision`,
      'POST',
      {
        adminUserId: input.adminUserId,
        decision: input.decision,
        reason: input.reason,
      },
    );
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'CATALOG_SERVICE_URL',
      'http://localhost:8503',
    );
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('catalog_dependency_unavailable');
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
