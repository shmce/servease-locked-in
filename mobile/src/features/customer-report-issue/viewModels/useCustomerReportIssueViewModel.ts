import { useMemo } from 'react';
import {
  customerIssueTypes,
  customerResolutionOptions,
} from '../../../constants/appContent';

type CustomerReportIssueViewModelInput = {
  supportSubject: string;
  supportMessage: string;
  desiredResolution: string;
  evidencePhotoUrl: string | null;
  busyAction: string | null;
};

export function useCustomerReportIssueViewModel({
  supportSubject,
  supportMessage,
  desiredResolution,
  evidencePhotoUrl,
  busyAction,
}: CustomerReportIssueViewModelInput) {
  return useMemo(
    () =>
      buildCustomerReportIssueViewModel({
        supportSubject,
        supportMessage,
        desiredResolution,
        evidencePhotoUrl,
        busyAction,
      }),
    [busyAction, desiredResolution, evidencePhotoUrl, supportMessage, supportSubject],
  );
}

export function buildCustomerReportIssueViewModel({
  supportSubject,
  supportMessage,
  desiredResolution,
  evidencePhotoUrl,
  busyAction,
}: CustomerReportIssueViewModelInput) {
  const issueTypeRows = customerIssueTypes.map((issue) => ({
    issue,
    selected: supportSubject === issue,
  }));
  const resolutionRows = customerResolutionOptions.map((resolution) => ({
    resolution,
    selected: desiredResolution === resolution,
  }));
  const canSubmit =
    Boolean(supportSubject.trim()) &&
    Boolean(supportMessage.trim()) &&
    Boolean(desiredResolution) &&
    busyAction !== 'dispute';

  return {
    data: {
      canSubmit,
      evidenceLabel: evidencePhotoUrl ? 'Evidence uploaded' : 'Attach evidence',
      issueTypeRows,
      resolutionRows,
    },
    isLoading: false,
    error: null,
  };
}
