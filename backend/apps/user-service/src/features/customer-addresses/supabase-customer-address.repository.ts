import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { CustomerAddressRepository } from './customer-address.service';
import {
  CreateCustomerAddressInput,
  CustomerAddressSummary,
  UpdateCustomerAddressInput,
} from './customer-address.types';

interface SupabaseCustomerAddressRow {
  id: string;
  user_id: string;
  label: string | null;
  address: string;
  barangay: string | null;
  city: string | null;
  province: string | null;
  region: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  is_default: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

type SupabaseError = { message: string } | null;

interface SupabaseRpcResult<T> {
  data: T;
  error: SupabaseError;
}

interface SupabaseQueryClient {
  rpc(
    functionName: string,
    args: Record<string, string | number | boolean | null>,
  ): {
    maybeSingle(): PromiseLike<SupabaseRpcResult<SupabaseCustomerAddressRow | null>>;
    single(): PromiseLike<SupabaseRpcResult<SupabaseCustomerAddressRow>>;
  } & PromiseLike<SupabaseRpcResult<SupabaseCustomerAddressRow[]>>;
}

@Injectable()
export class SupabaseCustomerAddressRepository
  implements CustomerAddressRepository
{
  private readonly client: SupabaseQueryClient;

  constructor(client?: SupabaseQueryClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseQueryClient);
  }

  async listByUserId(userId: string): Promise<CustomerAddressSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_list_customer_addresses',
      {
        p_user_id: userId,
      },
    );

    if (error) {
      throw new Error(`Failed to list customer addresses: ${error.message}`);
    }

    return (data ?? []).map((row) => this.toSummary(row));
  }

  async create(input: CreateCustomerAddressInput): Promise<CustomerAddressSummary> {
    const { data, error } = await this.client
      .rpc('servease_create_customer_address', {
        p_user_id: input.userId,
        p_label: input.label?.trim() || null,
        p_address: input.address.trim(),
        p_barangay: input.barangay?.trim() || null,
        p_city: input.city?.trim() || null,
        p_province: input.province?.trim() || null,
        p_region: input.region?.trim() || null,
        p_latitude: input.latitude ?? null,
        p_longitude: input.longitude ?? null,
        p_is_default: input.isDefault ?? false,
      })
      .single();

    if (error) {
      throw new Error(`Failed to create customer address: ${error.message}`);
    }

    return this.toSummary(data);
  }

  async update(input: UpdateCustomerAddressInput): Promise<CustomerAddressSummary> {
    const { data, error } = await this.client
      .rpc('servease_update_customer_address', {
        p_user_id: input.userId,
        p_address_id: input.addressId,
        p_label: input.label?.trim() || null,
        p_address: input.address?.trim() || null,
        p_barangay: input.barangay?.trim() || null,
        p_city: input.city?.trim() || null,
        p_province: input.province?.trim() || null,
        p_region: input.region?.trim() || null,
        p_latitude: input.latitude ?? null,
        p_longitude: input.longitude ?? null,
        p_is_default: input.isDefault ?? null,
      })
      .single();

    if (error) {
      throw new Error(`Failed to update customer address: ${error.message}`);
    }

    return this.toSummary(data);
  }

  async setDefault(
    userId: string,
    addressId: string,
  ): Promise<CustomerAddressSummary> {
    const { data, error } = await this.client
      .rpc('servease_set_default_customer_address', {
        p_user_id: userId,
        p_address_id: addressId,
      })
      .single();

    if (error) {
      throw new Error(`Failed to set default customer address: ${error.message}`);
    }

    return this.toSummary(data);
  }

  async delete(userId: string, addressId: string): Promise<{ ok: true }> {
    const { error } = await this.client.rpc('servease_delete_customer_address', {
      p_user_id: userId,
      p_address_id: addressId,
    });

    if (error) {
      throw new Error(`Failed to delete customer address: ${error.message}`);
    }

    return { ok: true };
  }

  private toSummary(
    row: SupabaseCustomerAddressRow,
  ): CustomerAddressSummary {
    return {
      id: row.id,
      userId: row.user_id,
      label: row.label ?? 'Saved address',
      address: row.address,
      barangay: row.barangay,
      city: row.city,
      province: row.province,
      region: row.region,
      latitude: row.latitude === null ? null : Number(row.latitude),
      longitude: row.longitude === null ? null : Number(row.longitude),
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
