import { Buffer } from 'node:buffer';
import { InvalidUploadRequestError } from './upload.errors';
import { UploadGatewayService } from './upload.service';

describe('UploadGatewayService', () => {
  it('uploads validated media to the configured storage bucket', async () => {
    process.env.SUPABASE_STORAGE_BUCKET = 'test-uploads';
    const storageObject = {
      upload: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: 'https://storage.test/test-uploads/path.jpg' },
      }),
    };
    const client = {
      storage: {
        getBucket: jest.fn().mockResolvedValue({ error: null }),
        createBucket: jest.fn(),
        from: jest.fn().mockReturnValue(storageObject),
      },
    };
    const service = new UploadGatewayService(client);

    const upload = await service.uploadFile('user-1', 'booking_reference', {
      originalname: 'sink.jpg',
      mimetype: 'image/jpeg',
      size: 12,
      buffer: Buffer.from('image-bytes'),
    });

    expect(client.storage.getBucket).toHaveBeenCalledWith('test-uploads');
    expect(storageObject.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^booking_reference\/user-1\/\d{4}-\d{2}-\d{2}\/.+\.jpg$/),
      Buffer.from('image-bytes'),
      { contentType: 'image/jpeg', upsert: false },
    );
    expect(upload).toEqual(
      expect.objectContaining({
        bucket: 'test-uploads',
        kind: 'booking_reference',
        publicUrl: 'https://storage.test/test-uploads/path.jpg',
      }),
    );
  });

  it('rejects unsupported upload requests before storage access', async () => {
    const client = {
      storage: {
        getBucket: jest.fn(),
        createBucket: jest.fn(),
        from: jest.fn(),
      },
    };
    const service = new UploadGatewayService(client);

    await expect(
      service.uploadFile('user-1', 'avatar', {
        originalname: 'script.svg',
        mimetype: 'image/svg+xml',
        size: 10,
        buffer: Buffer.from('<svg />'),
      }),
    ).rejects.toBeInstanceOf(InvalidUploadRequestError);
    expect(client.storage.getBucket).not.toHaveBeenCalled();
  });

  it('records provider document uploads with the catalog service', async () => {
    process.env.SUPABASE_STORAGE_BUCKET = 'test-uploads';
    const storageObject = {
      upload: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: 'https://storage.test/test-uploads/document.pdf' },
      }),
    };
    const client = {
      storage: {
        getBucket: jest.fn().mockResolvedValue({ error: null }),
        createBucket: jest.fn(),
        from: jest.fn().mockReturnValue(storageObject),
      },
    };
    const catalogClient = {
      submitProviderApplicationDocument: jest.fn().mockResolvedValue({
        id: 'document-1',
        applicationId: 'provider-1',
        userId: 'user-1',
        documentType: 'government_id',
        fileUrl: 'https://storage.test/test-uploads/document.pdf',
        storagePath: 'provider_document/user-1/2026-05-19/document.pdf',
        status: 'pending',
        createdAt: null,
        previewUrl: null,
        downloadUrl: null,
      }),
    };
    const service = new UploadGatewayService(client, catalogClient as never);

    const upload = await service.uploadFile(
      'user-1',
      'provider_document',
      {
        originalname: 'id.pdf',
        mimetype: 'application/pdf',
        size: 12,
        buffer: Buffer.from('pdf-bytes'),
      },
      { documentType: 'government_id' },
    );

    expect(storageObject.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^provider_document\/user-1\/\d{4}-\d{2}-\d{2}\/.+\.pdf$/),
      Buffer.from('pdf-bytes'),
      { contentType: 'application/pdf', upsert: false },
    );
    expect(catalogClient.submitProviderApplicationDocument).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        documentType: 'government_id',
        fileUrl: 'https://storage.test/test-uploads/document.pdf',
      }),
    );
    expect(upload.document?.id).toBe('document-1');
  });
});
