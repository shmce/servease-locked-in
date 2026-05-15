import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { ProviderProfileRepository } from './provider-profile.service';
import {
  CreateProviderProfileInput,
  ProviderPortfolioMediaInput,
  ProviderPortfolioMediaSummary,
  ProviderProfileSummary,
  UpdateProviderProfileInput,
} from './provider-profile.types';

interface SupabaseQueryClient {
  rpc(
    functionName: string,
    args: Record<string, unknown>,
  ): PromiseLike<{
    data: SupabasePortfolioMediaRow[] | null;
    error: { message: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data: SupabaseProviderProfileRow | SupabasePortfolioMediaRow | null;
      error: { message: string } | null;
    }>;
  };
}

interface SupabaseProviderProfileRow {
  id: string;
  business_name: string | null;
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

@Injectable()
export class SupabaseProviderProfileRepository
  implements ProviderProfileRepository
{
  private readonly client: SupabaseQueryClient;

  constructor(client?: SupabaseQueryClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseQueryClient);
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

    return (data ?? []).map((row) => this.mapPortfolioMedia(row));
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

  private mapProviderProfile(
    data: SupabaseProviderProfileRow,
  ): ProviderProfileSummary {
    return {
      id: data.id,
      businessName: data.business_name,
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
}
