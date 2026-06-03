import {
  CustomerContent,
  CustomerHeader,
  CustomerScreen,
  CustomerSection,
} from '../../../shared/components/CustomerUI';
import { TwoFactorSettingsCard } from '../../../shared/components/TwoFactorSettingsCard';

type CustomerSecurityScreenProps = {
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

export function CustomerSecurityScreen({
  busyAction,
  onBack,
  twoFactorCode,
  twoFactorEnabled,
  twoFactorSecret,
  setTwoFactorCode,
  startTwoFactorSetup,
  verifyTwoFactorSetup,
  disableTwoFactorSetup,
}: CustomerSecurityScreenProps) {
  return (
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="Security"
          subtitle="Protect your account"
          onBack={onBack}
        />

        <CustomerSection title="Account protection">
          <TwoFactorSettingsCard
            busyAction={busyAction}
            twoFactorCode={twoFactorCode}
            twoFactorEnabled={twoFactorEnabled}
            twoFactorSecret={twoFactorSecret}
            variant="customer"
            onCodeChange={setTwoFactorCode}
            startTwoFactorSetup={startTwoFactorSetup}
            verifyTwoFactorSetup={verifyTwoFactorSetup}
            disableTwoFactorSetup={disableTwoFactorSetup}
          />
        </CustomerSection>
      </CustomerContent>
    </CustomerScreen>
  );
}
