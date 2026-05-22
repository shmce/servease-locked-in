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
      birthdate: null,
    });
  });

  it('creates provider registrations with normalized birthdate', async () => {
    const registrationService = {
      register: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'provider@example.com',
        fullName: 'Provider Example',
        contactNumber: '+639171234567',
        role: 'provider',
        status: 'active',
      }),
    } as unknown as RegistrationService;
    const controller = new RegistrationController(registrationService);

    await controller.create({
      role: 'provider',
      email: ' Provider@Example.com ',
      password: 'Password#2026',
      fullName: ' Provider Example ',
      contactNumber: ' +639171234567 ',
      birthdate: ' 1990-05-23 ',
    });

    expect(registrationService.register).toHaveBeenCalledWith({
      role: 'provider',
      email: 'provider@example.com',
      password: 'Password#2026',
      fullName: 'Provider Example',
      contactNumber: '+639171234567',
      birthdate: '1990-05-23',
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

  it('rejects provider registrations without an adult birthdate', async () => {
    const controller = new RegistrationController({} as RegistrationService);

    await expect(
      controller.create({
        role: 'provider',
        email: 'provider@example.com',
        password: 'Password#2026',
        fullName: 'Provider Example',
        birthdate: '',
      }),
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      controller.create({
        role: 'provider',
        email: 'provider@example.com',
        password: 'Password#2026',
        fullName: 'Provider Example',
        birthdate: nextYearBirthdate(),
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});

function nextYearBirthdate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
