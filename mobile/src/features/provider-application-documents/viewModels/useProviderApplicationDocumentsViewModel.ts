import { useMemo } from 'react';
import { formatDateTime } from '../../../domain/booking';
import type { ProviderApplicationDocumentSummary } from '../../../shared/models/types';

type ProviderApplicationDocumentsViewModelInput = {
  documents: ProviderApplicationDocumentSummary[];
  busyAction: string | null;
};

type DocumentSlotDefinition = {
  id: string;
  title: string;
  body: string;
  required: boolean;
};

const documentSlots: DocumentSlotDefinition[] = [
  {
    id: 'government_id',
    title: 'Government ID',
    body: 'Upload a clear photo of a valid government-issued ID.',
    required: true,
  },
  {
    id: 'selfie_photo',
    title: 'Selfie Photo',
    body: 'Upload a current selfie so admin can match your identity.',
    required: true,
  },
  {
    id: 'proof_of_address',
    title: 'Proof of Address',
    body: 'Upload a bill, statement, or document that confirms your address.',
    required: true,
  },
  {
    id: 'business_permit_or_certificate',
    title: 'Permit or Certificate',
    body: 'Upload a business permit, license, certificate, or trade record.',
    required: true,
  },
  {
    id: 'supporting_records',
    title: 'Supporting Records',
    body: 'Add optional records, work samples, or extra proof for review.',
    required: false,
  },
];

export function useProviderApplicationDocumentsViewModel({
  documents,
  busyAction,
}: ProviderApplicationDocumentsViewModelInput) {
  return useMemo(
    () => buildProviderApplicationDocumentsViewModel({ documents, busyAction }),
    [busyAction, documents],
  );
}

export function buildProviderApplicationDocumentsViewModel({
  documents,
  busyAction,
}: ProviderApplicationDocumentsViewModelInput) {
  const latestByType = new Map<string, ProviderApplicationDocumentSummary>();
  for (const document of [...documents].sort(compareNewestFirst)) {
    if (!latestByType.has(document.documentType)) {
      latestByType.set(document.documentType, document);
    }
  }

  const slots = documentSlots.map((slot) => {
    const document = latestByType.get(slot.id) ?? null;
    const isUploading = busyAction === `upload-provider_document-${slot.id}`;

    return {
      ...slot,
      document,
      actionLabel: isUploading
        ? 'Uploading...'
        : document
          ? 'Replace'
          : 'Upload',
      isActionDisabled: isUploading,
      statusLabel: document ? statusLabel(document.status) : 'Missing',
      statusTone: document ? statusTone(document.status) : 'warning' as const,
      updatedLabel: document?.createdAt
        ? `Uploaded ${formatDateTime(document.createdAt)}`
        : null,
    };
  });
  const requiredSlots = slots.filter((slot) => slot.required);
  const uploadedRequiredCount = requiredSlots.filter((slot) => slot.document).length;

  return {
    data: {
      slots,
      requiredCount: requiredSlots.length,
      uploadedRequiredCount,
      progressLabel: `${uploadedRequiredCount} of ${requiredSlots.length} required uploaded`,
      isComplete: uploadedRequiredCount === requiredSlots.length,
      refreshDisabled: busyAction === 'provider-application-documents',
    },
    isLoading: false,
    error: null,
  };
}

function compareNewestFirst(
  a: ProviderApplicationDocumentSummary,
  b: ProviderApplicationDocumentSummary,
) {
  return timestamp(b.createdAt) - timestamp(a.createdAt);
}

function timestamp(value: string | null) {
  return value ? new Date(value).getTime() : 0;
}

function statusLabel(status: ProviderApplicationDocumentSummary['status']) {
  if (status === 'approved') {
    return 'Approved';
  }
  if (status === 'rejected') {
    return 'Rejected';
  }
  return 'Needs review';
}

function statusTone(status: ProviderApplicationDocumentSummary['status']) {
  if (status === 'approved') {
    return 'success' as const;
  }
  if (status === 'rejected') {
    return 'danger' as const;
  }
  return 'warning' as const;
}
