export interface CustomerProfileSummary {
  id: string;
  address: string | null;
}

export interface CreateCustomerProfileInput {
  userId: string;
  address?: string | null;
}

export interface UpdateCustomerProfileInput {
  userId: string;
  address?: string | null;
}
