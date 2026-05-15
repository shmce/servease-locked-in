import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';

describe('RegistrationController', () => {
  it('creates internal registrations with normalized input', async () => {
    const registrationService = {
      register: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'customer@example.com',
        fullName: 'Customer Example',
        contactNumber: null,
        role: 'customer',
        status: 'active',
      }),
    } as unknown as RegistrationService;
    const controller = new RegistrationController(registrationService);

    await controller.create({
      role: 'customer',
      email: ' Customer@Example.com ',
      password: 'Password#2026',
      fullName: ' Customer Example ',
      contactNumber: '',
    });

    expect(registrationService.register).toHaveBeenCalledWith({
      role: 'customer',
      email: 'customer@example.com',
      password: 'Password#2026',
      fullName: 'Customer Example',
      contactNumber: null,
    });
  });

  it('rejects short passwords', async () => {
    const controller = new RegistrationController({} as RegistrationService);

    await expect(
      controller.create({
        role: 'customer',
        email: 'customer@example.com',
        password: 'short',
        fullName: 'Customer Example',
      }),
    ).rejects.toMatchObject({
      status: 400,
    });
  });
});
