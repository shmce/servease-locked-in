import {
  ProviderContent,
  ProviderHeader,
  ProviderScreen,
  ProviderSection,
} from '../../../shared/components/ProviderUI';
import { TwoFactorSettingsCard } from '../../../shared/components/TwoFactorSettingsCard';
import { useProviderSecurityViewModel } from '../viewModels/useProviderSecurityViewModel';

type ProviderSecurityScreenProps = {
  busyAction: string | null;
  onBack: () => void;
  twoFactorCode: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  setTwoFactorCode: (value: string) => void;
  startTwoFactorSetup: () => void | Promise<void>;
  verifyTwoFactorSetup: () => void | Promise<void>;
  disableTwoFactorSetup: () => void | Promise<void>;
};

export function ProviderSecurityScreen({
  busyAction,
  onBack,
  twoFactorCode,
  twoFactorEnabled,
  twoFactorSecret,
  setTwoFactorCode,
  startTwoFactorSetup,
  verifyTwoFactorSetup,
  disableTwoFactorSetup,
}: ProviderSecurityScreenProps) {
  const security = useProviderSecurityViewModel();

  return (
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title={security.data.pageTitle}
          subtitle={security.data.pageSubtitle}
          onBack={onBack}
        />
        <ProviderSection title={security.data.sectionTitle}>
          <TwoFactorSettingsCard
            busyAction={busyAction}
            twoFactorCode={twoFactorCode}
            twoFactorEnabled={twoFactorEnabled}
            twoFactorSecret={twoFactorSecret}
            onCodeChange={setTwoFactorCode}
            startTwoFactorSetup={startTwoFactorSetup}
            verifyTwoFactorSetup={verifyTwoFactorSetup}
            disableTwoFactorSetup={disableTwoFactorSetup}
          />
        </ProviderSection>
      </ProviderContent>
    </ProviderScreen>
  );
}
