import { Injectable, Optional } from '@nestjs/common';
import { Buffer } from 'node:buffer';
import { randomUUID } from 'crypto';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import {
  InvalidUploadRequestError,
  UploadDependencyUnavailableError,
} from './upload.errors';
import { UploadedFile, UploadKind, UploadSummary } from './upload.types';

interface StorageBucketApi {
  getBucket(bucket: string): PromiseLike<{ error: { message?: string } | null }>;
  createBucket(
    bucket: string,
    options: { public: boolean; fileSizeLimit: number; allowedMimeTypes: string[] },
  ): PromiseLike<{ error: { message?: string } | null }>;
}

interface StorageObjectApi {
  upload(
    path: string,
    body: Buffer,
    options: { contentType: string; upsert: boolean },
  ): PromiseLike<{ error: { message?: string } | null }>;
  getPublicUrl(path: string): { data: { publicUrl: string } };
}

interface SupabaseStorageClient {
  storage: StorageBucketApi & {
    from(bucket: string): StorageObjectApi;
  };
}

const allowedKinds: UploadKind[] = [
  'booking_reference',
  'support_evidence',
  'message_attachment',
  'provider_portfolio',
  'provider_progress',
  'provider_document',
];

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'video/quicktime',
];

const mimeExtensions: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
};

const maxUploadBytes = 10 * 1024 * 1024;

@Injectable()
export class UploadGatewayService {
  private readonly bucket: string;
  private bucketReady = false;

  constructor(
    @Optional() private readonly supabaseClient?: SupabaseStorageClient,
    @Optional() private readonly catalogServiceClient?: CatalogServiceClient,
  ) {
    this.bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'servease-uploads';
  }

  async uploadFile(
    userId: string,
    kind: string | undefined,
    file: UploadedFile | undefined,
    metadata: { documentType?: string | null } = {},
  ): Promise<UploadSummary> {
    if (!userId || !this.isUploadKind(kind) || !file?.buffer?.length) {
      throw new InvalidUploadRequestError();
    }

    if (kind === 'provider_document' && !metadata.documentType?.trim()) {
      throw new InvalidUploadRequestError();
    }

    if (file.size > maxUploadBytes || !allowedMimeTypes.includes(file.mimetype)) {
      throw new InvalidUploadRequestError();
    }

    const client =
      this.supabaseClient ??
      (createSupabaseServiceClient() as unknown as SupabaseStorageClient);
    await this.ensureBucket(client);

    const path = [
      kind,
      userId,
      new Date().toISOString().slice(0, 10),
      `${randomUUID()}${mimeExtensions[file.mimetype]}`,
    ].join('/');
    const { error } = await client.storage.from(this.bucket).upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

    if (error) {
      throw new UploadDependencyUnavailableError();
    }

    const { data } = client.storage.from(this.bucket).getPublicUrl(path);

    const upload: UploadSummary = {
      bucket: this.bucket,
      path,
      publicUrl: data.publicUrl,
      kind,
      contentType: file.mimetype,
      size: file.size,
    };

    if (kind === 'provider_document') {
      if (!this.catalogServiceClient) {
        throw new UploadDependencyUnavailableError();
      }

      upload.document =
        await this.catalogServiceClient.submitProviderApplicationDocument(userId, {
          documentType: metadata.documentType?.trim() ?? '',
          fileUrl: data.publicUrl,
          storagePath: path,
        });
    }

    return upload;
  }

  private isUploadKind(kind: string | undefined): kind is UploadKind {
    return Boolean(kind && allowedKinds.includes(kind as UploadKind));
  }

  private async ensureBucket(client: SupabaseStorageClient): Promise<void> {
    if (this.bucketReady) {
      return;
    }

    const { error: getError } = await client.storage.getBucket(this.bucket);
    if (!getError) {
      this.bucketReady = true;
      return;
    }

    const { error: createError } = await client.storage.createBucket(this.bucket, {
      public: true,
      fileSizeLimit: maxUploadBytes,
      allowedMimeTypes,
    });

    if (createError) {
      throw new UploadDependencyUnavailableError();
    }

    this.bucketReady = true;
  }
}
