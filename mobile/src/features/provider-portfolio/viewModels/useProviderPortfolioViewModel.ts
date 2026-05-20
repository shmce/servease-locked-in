import { useMemo } from 'react';
import { ProviderPortfolioMediaSummary } from '../../../shared/models/types';

type ProviderPortfolioViewModelInput = {
  providerPortfolioMedia: ProviderPortfolioMediaSummary[];
  hasUploadedPortfolioPhoto: boolean;
  editingPortfolioCaptionId: string | null;
  busyAction: string | null;
};

export function useProviderPortfolioViewModel({
  providerPortfolioMedia,
  hasUploadedPortfolioPhoto,
  editingPortfolioCaptionId,
  busyAction,
}: ProviderPortfolioViewModelInput) {
  return useMemo(
    () =>
      buildProviderPortfolioViewModel({
        providerPortfolioMedia,
        hasUploadedPortfolioPhoto,
        editingPortfolioCaptionId,
        busyAction,
      }),
    [
      busyAction,
      editingPortfolioCaptionId,
      hasUploadedPortfolioPhoto,
      providerPortfolioMedia,
    ],
  );
}

export function buildProviderPortfolioViewModel({
  providerPortfolioMedia,
  hasUploadedPortfolioPhoto,
  editingPortfolioCaptionId,
  busyAction,
}: ProviderPortfolioViewModelInput) {
  const portfolioItems = providerPortfolioMedia.map((item) => ({
    item,
    id: item.id,
    fileUrl: item.fileUrl,
    captionLabel: item.caption ?? item.fileName ?? 'Portfolio media',
    isEditingCaption: editingPortfolioCaptionId === item.id,
    captionSaveDisabled: busyAction === `portfolio-caption-${item.id}`,
  }));

  return {
    data: {
      uploadLabel: hasUploadedPortfolioPhoto
        ? 'Portfolio media uploaded'
        : 'Upload portfolio media',
      portfolioItems,
      hasPortfolioMedia: providerPortfolioMedia.length > 0,
    },
    isLoading: false,
    error: null,
  };
}
