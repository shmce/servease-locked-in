import { RegistrationService } from '../registration/registration.service';
import { AdminUserController } from './admin-user.controller';

describe('AdminUserController', () => {
  it('creates admin auth users with normalized profile input', async () => {
    const registrationService = {
      register: jest.fn().mockResolvedValue({
        id: 'new-admin-1',
        email: 'ops@example.com',
        fullName: 'Ops Admin',
        contactNumber: '+639171234567',
        role: 'admin',
        status: 'active',
      }),
    } as unknown as RegistrationService;
    const controller = new AdminUserController(registrationService);

    const response = await controller.create({
      email: ' Ops@Example.com ',
      password: 'Password#2026',
      fullName: ' Ops Admin ',
      contactNumber: ' +639171234567 ',
    });

    expect(registrationService.register).toHaveBeenCalledWith({
      email: 'ops@example.com',
      password: 'Password#2026',
      fullName: 'Ops Admin',
      contactNumber: '+639171234567',
      role: 'admin',
    });
    expect(response.data.role).toBe('admin');
  });
});
