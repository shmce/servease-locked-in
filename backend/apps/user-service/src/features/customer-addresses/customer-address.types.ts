export interface CustomerAddressSummary {
  id: string;
  userId: string;
  label: string;
  address: string;
  barangay: string | null;
  city: string | null;
  province: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateCustomerAddressInput {
  userId: string;
  label?: string | null;
  address: string;
  barangay?: string | null;
  city?: string | null;
  province?: string | null;
  region?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean | null;
}

export interface UpdateCustomerAddressInput
  extends Partial<Omit<CreateCustomerAddressInput, 'userId' | 'address'>> {
  userId: string;
  addressId: string;
  address?: string | null;
}
