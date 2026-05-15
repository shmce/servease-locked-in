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
});
