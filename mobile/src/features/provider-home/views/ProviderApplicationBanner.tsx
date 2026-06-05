import { StyleSheet, Text, View } from 'react-native';
import type {
  CurrentUserProfile,
  ProviderApplicationStatus,
} from '../../../shared/models/types';
import {
  ProviderBadge,
  ProviderButton,
  ProviderCard,
  providerText,
} from '../../../shared/components/ProviderUI';
import { spacing } from '../../../theme/serveaseDesign';
import { useProviderApplicationBannerViewModel } from '../viewModels/useProviderApplicationBannerViewModel';

type ProviderApplicationBannerProps = {
  profile: CurrentUserProfile | null;
  providerApplication: ProviderApplicationStatus | null;
  busyAction: string | null;
  onRefreshStatus: () => void | Promise<void>;
  onOpenApplicationDocuments: () => void;
};

export function ProviderApplicationBanner({
  profile,
  providerApplication,
  busyAction,
  onRefreshStatus,
  onOpenApplicationDocuments,
}: ProviderApplicationBannerProps) {
  const banner = useProviderApplicationBannerViewModel({
    profile,
    providerApplication,
    busyAction,
  });
  const { data } = banner;

  if (!data.visible) {
    return null;
  }

  return (
    <ProviderCard>
      <View style={styles.headerRow}>
        <View style={styles.copy}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.body}>{data.body}</Text>
          {data.latestDecisionAtLabel ? (
            <Text style={styles.meta}>{data.latestDecisionAtLabel}</Text>
          ) : null}
        </View>
        <ProviderBadge label={data.applicationStatus ?? 'pending'} tone={data.tone} />
      </View>
      <ProviderButton
        label="Refresh Status"
        variant="secondary"
        onPress={onRefreshStatus}
        disabled={data.refreshDisabled}
      />
      <ProviderButton
        label="Application Documents"
        variant="secondary"
        onPress={onOpenApplicationDocuments}
        disabled={data.uploadDisabled}
      />
    </ProviderCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...providerText.title,
  },
  body: {
    ...providerText.body,
  },
  meta: {
    ...providerText.meta,
  },
});
