import {
  CustomerAddressRepository,
  CustomerAddressService,
} from './customer-address.service';

describe('CustomerAddressService', () => {
  it('delegates saved address creation to the repository', async () => {
    const repository: CustomerAddressRepository = {
      listByUserId: jest.fn(),
      create: jest.fn().mockResolvedValue({
        id: 'address-1',
        userId: 'user-1',
        label: 'Home',
        address: '123 Test St',
        barangay: null,
        city: 'Manila',
        province: null,
        region: null,
        latitude: null,
        longitude: null,
        isDefault: true,
        createdAt: null,
        updatedAt: null,
      }),
      update: jest.fn(),
      setDefault: jest.fn(),
      delete: jest.fn(),
    };
    const service = new CustomerAddressService(repository);

    await service.create({
      userId: 'user-1',
      label: 'Home',
      address: '123 Test St',
      city: 'Manila',
      isDefault: true,
    });

    expect(repository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      label: 'Home',
      address: '123 Test St',
      city: 'Manila',
      isDefault: true,
    });
  });

  it('sets one saved address as default', async () => {
    const repository: CustomerAddressRepository = {
      listByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      setDefault: jest.fn().mockResolvedValue({
        id: 'address-1',
        userId: 'user-1',
        label: 'Home',
        address: '123 Test St',
        barangay: null,
        city: null,
        province: null,
        region: null,
        latitude: null,
        longitude: null,
        isDefault: true,
        createdAt: null,
        updatedAt: null,
      }),
      delete: jest.fn(),
    };
    const service = new CustomerAddressService(repository);

    await service.setDefault('user-1', 'address-1');

    expect(repository.setDefault).toHaveBeenCalledWith('user-1', 'address-1');
  });
});
