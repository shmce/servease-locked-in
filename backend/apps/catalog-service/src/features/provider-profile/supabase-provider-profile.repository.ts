import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { ProviderProfileRepository } from './provider-profile.service';
import {
  CreateProviderProfileInput,
  AdminProviderApplicationDocumentSummary,
  AdminProviderApplicationSummary,
  ProviderPortfolioMediaInput,
  ProviderPortfolioMediaSummary,
  ProviderOwnedServiceInput,
  ProviderOwnedServiceSummary,
  ProviderProfileSummary,
  UpdateProviderProfileInput,
} from './provider-profile.types';

interface SupabaseQueryClient {
  rpc(
    functionName: string,
    args: Record<string, unknown>,
  ): PromiseLike<{
    data:
      | SupabasePortfolioMediaRow[]
      | SupabaseProviderOwnedServiceRow[]
      | SupabaseProviderApplicationRow[]
      | null;
    error: { message: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data:
        | SupabaseProviderProfileRow
        | SupabasePortfolioMediaRow
        | SupabaseProviderApplicationRow
        | null;
      error: { message: string } | null;
    }>;
  };
  schema(schema: string): {
    from(table: string): {
      select(columns: string): SupabaseDocumentFilterBuilder;
    };
  };
  storage: {
    from(bucket: string): {
      createSignedUrl(
        path: string,
        expiresIn: number,
        options?: { download?: boolean },
      ): PromiseLike<{
        data: { signedUrl: string } | null;
        error: { message: string } | null;
      }>;
    };
  };
}

interface SupabaseDocumentFilterBuilder
  extends PromiseLike<{
    data: SupabaseProviderDocumentRow[] | null;
    error: { message: string } | null;
  }> {
  eq(column: string, value: string): SupabaseDocumentFilterBuilder;
  maybeSingle(): PromiseLike<{
    data: SupabaseProviderDocumentRow | null;
    error: { message: string } | null;
  }>;
}

interface SupabaseProviderProfileRow {
  id: string;
  business_name: string | null;
  bio?: string | null;
  service_description?: string | null;
  service_area?: string | null;
  years_experience?: number | string | null;
  verification_status: 'pending' | 'approved' | 'rejected';
  average_rating: number | string | null;
  review_count: number | null;
}

interface SupabasePortfolioMediaRow {
  id: string;
  provider_id: string;
  uploaded_by: string | null;
  file_url: string;
  file_name: string | null;
  mime_type: string | null;
  storage_path: string | null;
  file_size: number | null;
  caption: string | null;
  sort_order: number | null;
  created_at: string | null;
}

interface SupabaseProviderOwnedServiceRow {
  id: string;
  provider_id: string;
  provider_business_name: string | null;
  service_id: string | null;
  title: string;
  description: string | null;
  price: number | string | null;
  pricing_mode: 'flat' | 'hourly' | null;
  average_rating: number | string | null;
  review_count: number | null;
  verification_status: 'pending' | 'approved' | 'rejected';
  is_active: boolean | null;
}

interface SupabaseProviderApplicationRow {
  id: string;
  application_reference: string;
  user_id: string;
  business_name: string | null;
  service_area: string | null;
  service_description: string | null;
  years_experience: number | string | null;
  verification_status: 'pending' | 'approved' | 'rejected';
  is_active: boolean | null;
  average_rating: number | string | null;
  review_count: number | null;
  service_count: number | null;
  document_count: number | null;
  pending_document_count: number | null;
  approved_document_count: number | null;
  rejected_document_count: number | null;
  latest_decision_reason: string | null;
  latest_decision_at: string | null;
  latest_decided_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface SupabaseProviderDocumentRow {
  id: string;
  user_id: string;
  document_type: string;
  file_url: string | null;
  storage_path: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string | null;
}

@Injectable()
export class SupabaseProviderProfileRepository
  implements ProviderProfileRepository
{
  private readonly client: SupabaseQueryClient;
  private readonly storageBucket: string;

  constructor(client?: SupabaseQueryClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseQueryClient);
    this.storageBucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'servease-uploads';
  }

  async findByUserId(userId: string): Promise<ProviderProfileSummary | null> {
    const { data, error } = await this.client
      .rpc('servease_get_provider_profile', {
        p_user_id: userId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load provider profile: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.mapProviderProfile(data as SupabaseProviderProfileRow);
  }

  async create(input: CreateProviderProfileInput): Promise<ProviderProfileSummary> {
    const { data, error } = await this.client
      .rpc('servease_create_provider_profile', {
        p_user_id: input.userId,
        p_business_name: input.businessName.trim(),
        p_service_description: input.serviceDescription?.trim() || null,
        p_service_area: input.serviceArea?.trim() || null,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to create provider profile: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create provider profile: missing profile row');
    }

    return this.mapProviderProfile(data as SupabaseProviderProfileRow);
  }

  async update(input: UpdateProviderProfileInput): Promise<ProviderProfileSummary> {
    const { data, error } = await this.client
      .rpc('servease_update_provider_profile', {
        p_user_id: input.userId,
        p_business_name: input.businessName.trim(),
        p_bio: input.bio?.trim() || null,
        p_service_description: input.serviceDescription?.trim() || null,
        p_service_area: input.serviceArea?.trim() || null,
        p_years_experience: input.yearsExperience ?? null,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update provider profile: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to update provider profile: missing profile row');
    }

    return this.mapProviderProfile(data as SupabaseProviderProfileRow);
  }

  async listPortfolioMedia(
    providerId: string,
  ): Promise<ProviderPortfolioMediaSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_list_provider_portfolio_media',
      {
        p_provider_id: providerId,
      },
    );

    if (error) {
      throw new Error(`Failed to list provider portfolio: ${error.message}`);
    }

    return ((data ?? []) as SupabasePortfolioMediaRow[]).map((row) =>
      this.mapPortfolioMedia(row),
    );
  }

  async addPortfolioMedia(
    input: ProviderPortfolioMediaInput,
  ): Promise<ProviderPortfolioMediaSummary> {
    const { data, error } = await this.client
      .rpc('servease_add_provider_portfolio_media', {
        p_user_id: input.userId,
        p_file_url: input.fileUrl,
        p_file_name: input.fileName ?? null,
        p_mime_type: input.mimeType ?? null,
        p_storage_path: input.storagePath ?? null,
        p_file_size: input.fileSize ?? null,
        p_caption: input.caption ?? null,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to add provider portfolio: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to add provider portfolio: missing media row');
    }

    return this.mapPortfolioMedia(data as SupabasePortfolioMediaRow);
  }

  async deletePortfolioMedia(userId: string, mediaId: string): Promise<void> {
    const { error } = await this.client.rpc(
      'servease_delete_provider_portfolio_media',
      {
        p_user_id: userId,
        p_media_id: mediaId,
      },
    );

    if (error) {
      throw new Error(`Failed to delete provider portfolio: ${error.message}`);
    }
  }

  async listOwnedServices(userId: string): Promise<ProviderOwnedServiceSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_list_provider_owned_services',
      {
        p_user_id: userId,
      },
    );

    if (error) {
      throw new Error(`Failed to list provider services: ${error.message}`);
    }

    return ((data ?? []) as SupabaseProviderOwnedServiceRow[]).map((row) =>
      this.mapOwnedService(row),
    );
  }

  async replaceOwnedServices(
    userId: string,
    services: ProviderOwnedServiceInput[],
  ): Promise<ProviderOwnedServiceSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_replace_provider_owned_services',
      {
        p_user_id: userId,
        p_services: services,
      },
    );

    if (error) {
      throw new Error(`Failed to replace provider services: ${error.message}`);
    }

    return ((data ?? []) as SupabaseProviderOwnedServiceRow[]).map((row) =>
      this.mapOwnedService(row),
    );
  }

  async listProviderApplications(filter: {
    status?: 'pending' | 'approved' | 'rejected' | null;
    query?: string | null;
    limit?: number | null;
  }): Promise<AdminProviderApplicationSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_admin_list_provider_applications',
      {
        p_status: filter.status ?? null,
        p_query: filter.query ?? null,
        p_limit: filter.limit ?? 100,
      },
    );

    if (error) {
      throw new Error(`Failed to list provider applications: ${error.message}`);
    }

    return ((data ?? []) as SupabaseProviderApplicationRow[]).map((row) =>
      this.mapProviderApplication(row),
    );
  }

  async getProviderApplication(
    applicationId: string,
  ): Promise<AdminProviderApplicationSummary | null> {
    const application = await this.getProviderApplicationBase(applicationId);
    if (!application) {
      return null;
    }

    return {
      ...application,
      documents: await this.listProviderApplicationDocuments(application),
    };
  }

  private async getProviderApplicationBase(
    applicationId: string,
  ): Promise<AdminProviderApplicationSummary | null> {
    const { data, error } = await this.client
      .rpc('servease_admin_get_provider_application', {
        p_provider_id: applicationId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get provider application: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.mapProviderApplication(data as SupabaseProviderApplicationRow);
  }

  async getProviderApplicationDocument(
    applicationId: string,
    documentId: string,
  ): Promise<AdminProviderApplicationDocumentSummary | null> {
    const application = await this.getProviderApplicationBase(applicationId);
    if (!application) {
      return null;
    }

    const { data, error } = await this.client
      .schema('provider_catalog')
      .from('provider_documents')
      .select('id,user_id,document_type,file_url,storage_path,status,created_at')
      .eq('id', documentId)
      .eq('user_id', application.userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get provider document: ${error.message}`);
    }

    return data ? this.mapProviderDocument(data, application.id) : null;
  }

  async decideProviderApplication(input: {
    applicationId: string;
    adminUserId: string;
    decision: 'approved' | 'rejected';
    reason: string;
  }): Promise<AdminProviderApplicationSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_decide_provider_application', {
        p_provider_id: input.applicationId,
        p_admin_user_id: input.adminUserId,
        p_decision: input.decision,
        p_reason: input.reason,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to decide provider application: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to decide provider application: missing row');
    }

    return this.mapProviderApplication(data as SupabaseProviderApplicationRow);
  }

  private mapProviderProfile(
    data: SupabaseProviderProfileRow,
  ): ProviderProfileSummary {
    return {
      id: data.id,
      businessName: data.business_name,
      bio: data.bio ?? null,
      serviceDescription: data.service_description ?? null,
      serviceArea: data.service_area ?? null,
      yearsExperience:
        data.years_experience === null || data.years_experience === undefined
          ? null
          : Number(data.years_experience),
      verificationStatus: data.verification_status,
      averageRating: Number(data.average_rating ?? 0),
      reviewCount: data.review_count ?? 0,
    };
  }

  private mapPortfolioMedia(
    row: SupabasePortfolioMediaRow,
  ): ProviderPortfolioMediaSummary {
    return {
      id: row.id,
      providerId: row.provider_id,
      uploadedBy: row.uploaded_by,
      fileUrl: row.file_url,
      fileName: row.file_name,
      mimeType: row.mime_type,
      storagePath: row.storage_path,
      fileSize: row.file_size,
      caption: row.caption,
      sortOrder: row.sort_order ?? 0,
      createdAt: row.created_at,
    };
  }

  private mapOwnedService(
    row: SupabaseProviderOwnedServiceRow,
  ): ProviderOwnedServiceSummary {
    return {
      id: row.id,
      providerId: row.provider_id,
      providerBusinessName: row.provider_business_name,
      serviceId: row.service_id,
      title: row.title,
      description: row.description,
      price: row.price === null ? null : Number(row.price),
      pricingMode: row.pricing_mode ?? 'flat',
      averageRating: Number(row.average_rating ?? 0),
      reviewCount: row.review_count ?? 0,
      verificationStatus: row.verification_status,
      isActive: row.is_active ?? true,
    };
  }

  private mapProviderApplication(
    row: SupabaseProviderApplicationRow,
  ): AdminProviderApplicationSummary {
    return {
      id: row.id,
      applicationReference: row.application_reference,
      userId: row.user_id,
      businessName: row.business_name,
      serviceArea: row.service_area,
      serviceDescription: row.service_description,
      yearsExperience:
        row.years_experience === null || row.years_experience === undefined
          ? null
          : Number(row.years_experience),
      verificationStatus: row.verification_status,
      isActive: row.is_active ?? true,
      averageRating: Number(row.average_rating ?? 0),
      reviewCount: row.review_count ?? 0,
      serviceCount: row.service_count ?? 0,
      documentCount: row.document_count ?? 0,
      pendingDocumentCount: row.pending_document_count ?? 0,
      approvedDocumentCount: row.approved_document_count ?? 0,
      rejectedDocumentCount: row.rejected_document_count ?? 0,
      latestDecisionReason: row.latest_decision_reason,
      latestDecisionAt: row.latest_decision_at,
      latestDecidedBy: row.latest_decided_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      documents: [],
    };
  }

  private async listProviderApplicationDocuments(
    application: AdminProviderApplicationSummary,
  ): Promise<AdminProviderApplicationDocumentSummary[]> {
    const { data, error } = await this.client
      .schema('provider_catalog')
      .from('provider_documents')
      .select('id,user_id,document_type,file_url,storage_path,status,created_at')
      .eq('user_id', application.userId);

    if (error) {
      throw new Error(`Failed to list provider documents: ${error.message}`);
    }

    return Promise.all(
      ((data ?? []) as SupabaseProviderDocumentRow[]).map((row) =>
        this.mapProviderDocument(row, application.id),
      ),
    );
  }

  private async mapProviderDocument(
    row: SupabaseProviderDocumentRow,
    applicationId: string,
  ): Promise<AdminProviderApplicationDocumentSummary> {
    const previewUrl =
      row.file_url ?? (await this.createSignedUrl(row.storage_path, false));
    const downloadUrl =
      row.file_url ?? (await this.createSignedUrl(row.storage_path, true));

    return {
      id: row.id,
      applicationId,
      userId: row.user_id,
      documentType: row.document_type,
      fileUrl: row.file_url,
      storagePath: row.storage_path,
      status: row.status,
      createdAt: row.created_at,
      previewUrl,
      downloadUrl,
    };
  }

  private async createSignedUrl(
    storagePath: string | null,
    download: boolean,
  ): Promise<string | null> {
    if (!storagePath) {
      return null;
    }

    const storage = this.client.storage.from(this.storageBucket);
    const { data, error } = download
      ? await storage.createSignedUrl(storagePath, 600, { download: true })
      : await storage.createSignedUrl(storagePath, 600);

    if (error) {
      throw new Error(`Failed to sign provider document: ${error.message}`);
    }

    return data?.signedUrl ?? null;
  }
}
