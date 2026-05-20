import { useMemo } from 'react';

type ProviderReportIssueViewModelInput = {
  providerReportReason: string;
  providerReportDetails: string;
  reportEvidencePhotoUrl: string | null;
  busyAction: string | null;
};

export function useProviderReportIssueViewModel({
  providerReportReason,
  providerReportDetails,
  reportEvidencePhotoUrl,
  busyAction,
}: ProviderReportIssueViewModelInput) {
  return useMemo(
    () =>
      buildProviderReportIssueViewModel({
        providerReportReason,
        providerReportDetails,
        reportEvidencePhotoUrl,
        busyAction,
      }),
    [
      busyAction,
      providerReportDetails,
      providerReportReason,
      reportEvidencePhotoUrl,
    ],
  );
}

export function buildProviderReportIssueViewModel({
  providerReportReason,
  providerReportDetails,
  reportEvidencePhotoUrl,
  busyAction,
}: ProviderReportIssueViewModelInput) {
  const canSubmit =
    Boolean(providerReportReason.trim()) &&
    Boolean(providerReportDetails.trim()) &&
    busyAction !== 'support' &&
    busyAction !== 'dispute';

  return {
    data: {
      canSubmit,
      evidenceLabel: reportEvidencePhotoUrl ? 'Evidence uploaded' : 'Attach evidence',
      submitLabel: busyAction === 'dispute' ? 'Submitting' : 'Submit report',
    },
    isLoading: false,
    error: null,
  };
}
