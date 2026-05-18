import { Buffer } from 'node:buffer';
import { AuthTokenService } from '../current-user/auth-token.service';
import { UploadController } from './upload.controller';
import { UploadGatewayService } from './upload.service';

describe('UploadController', () => {
  it('creates uploads for the authenticated user', async () => {
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('user-1'),
    } as unknown as AuthTokenService;
    const uploadGatewayService = {
      uploadFile: jest.fn().mockResolvedValue({
        path: 'booking_reference/user-1/file.jpg',
      }),
    } as unknown as UploadGatewayService;
    const controller = new UploadController(uploadGatewayService, authTokenService);
    const file = {
      originalname: 'sink.jpg',
      mimetype: 'image/jpeg',
      size: 12,
      buffer: Buffer.from('image-bytes'),
    };

    const response = await controller.create(
      'Bearer token',
      'booking_reference',
      undefined,
      file,
    );

    expect(uploadGatewayService.uploadFile).toHaveBeenCalledWith(
      'user-1',
      'booking_reference',
      file,
      { documentType: undefined },
    );
    expect(response.data.path).toBe('booking_reference/user-1/file.jpg');
  });
});
