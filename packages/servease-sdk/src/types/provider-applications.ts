export type ProviderApplicationVerificationStatus =
  | 'pending'
  | 'approved'
  | 'rejected';

export interface ProviderApplicationStatus {
  id: string;
  applicationReference: string;
  businessName: string | null;
  serviceArea: string | null;
  serviceDescription: string | null;
  verificationStatus: ProviderApplicationVerificationStatus;
  latestDecisionReason: string | null;
  latestDecisionAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
