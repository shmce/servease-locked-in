import { useMemo } from 'react';
import { formatDateTime } from '../../../domain/booking';
import {
  CurrentUserProfile,
  ProviderApplicationStatus,
} from '../../../shared/models/types';

type ProviderApplicationBannerViewModelInput = {
  profile: CurrentUserProfile | null;
  providerApplication: ProviderApplicationStatus | null;
  busyAction: string | null;
};

type ProviderApplicationBannerTone = 'danger' | 'warning';

type ProviderApplicationBannerData = {
  applicationStatus: string | null;
  body: string;
  latestDecisionAtLabel: string | null;
  refreshDisabled: boolean;
  title: string;
  tone: ProviderApplicationBannerTone;
  uploadDisabled: boolean;
  visible: boolean;
};

export function useProviderApplicationBannerViewModel({
  profile,
  providerApplication,
  busyAction,
}: ProviderApplicationBannerViewModelInput) {
  return useMemo(
    () =>
      buildProviderApplicationBannerViewModel({
        profile,
        providerApplication,
        busyAction,
      }),
    [profile, providerApplication, busyAction],
  );
}

export function buildProviderApplicationBannerViewModel({
  profile,
  providerApplication,
  busyAction,
}: ProviderApplicationBannerViewModelInput): {
  data: ProviderApplicationBannerData;
  isLoading: boolean;
  error: string | null;
} {
  const applicationStatus =
    providerApplication?.verificationStatus ??
    profile?.providerProfile?.verificationStatus ??
    null;
  const isRejected = applicationStatus === 'rejected';
  const visible = Boolean(applicationStatus && applicationStatus !== 'approved');

  return {
    data: {
      applicationStatus,
      body:
        providerApplication?.latestDecisionReason ??
        (isRejected
          ? 'Review the admin decision before resubmitting your provider details.'
          : 'ServEase admin is reviewing your provider application.'),
      latestDecisionAtLabel: providerApplication?.latestDecisionAt
        ? `Updated ${formatDateTime(providerApplication.latestDecisionAt)}`
        : null,
      refreshDisabled: busyAction === 'provider-application',
      title: isRejected
        ? 'Application needs attention'
        : 'Application pending review',
      tone: isRejected ? 'danger' : 'warning',
      uploadDisabled: busyAction === 'upload-provider_document',
      visible,
    },
    isLoading: false,
    error: null,
  };
}
