import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { formatApiDate } from '../../../components/MonthCalendar';
import { AppRole, AppScreen } from '../../../navigation/types';
import { CatalogCategory, CatalogServiceItem } from '../../../shared/models/types';
import {
  AuthGate,
  AuthLoginScreen,
  AuthRegistrationScreen,
  AuthRoleChoiceScreen,
} from '../components';
import { useAuthViewModel } from '../viewModels/useAuthViewModel';

type AuthScreensProps = {
  screen: AppScreen;
  email: string;
  password: string;
  signupFullName: string;
  signupContactNumber: string;
  signupAddress: string;
  signupBusinessName: string;
  signupBirthdate: string;
  signupServiceArea: string;
  signupServiceDescription: string;
  signupExperienceYears: string;
  signupServiceId: string;
  categories: CatalogCategory[];
  services: CatalogServiceItem[];
  notice: string;
  busyAction: string | null;
  setEmail: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  setSignupFullName: Dispatch<SetStateAction<string>>;
  setSignupContactNumber: Dispatch<SetStateAction<string>>;
  setSignupAddress: Dispatch<SetStateAction<string>>;
  setSignupBusinessName: Dispatch<SetStateAction<string>>;
  setSignupBirthdate: Dispatch<SetStateAction<string>>;
  setSignupServiceArea: Dispatch<SetStateAction<string>>;
  setSignupServiceDescription: Dispatch<SetStateAction<string>>;
  setSignupExperienceYears: Dispatch<SetStateAction<string>>;
  setSignupServiceId: Dispatch<SetStateAction<string>>;
  navigate: (screen: AppScreen, nextRole?: AppRole | null) => void;
  signIn: (role: AppRole) => Promise<void>;
  signUp: (role: AppRole) => Promise<void>;
  requestPasswordReset: () => Promise<void>;
  startGoogleSignIn: (role: AppRole, flow?: 'login' | 'registration') => Promise<void>;
};

export function AuthScreens({
  screen,
  email,
  password,
  signupFullName,
  signupContactNumber,
  signupAddress,
  signupBusinessName,
  signupBirthdate,
  signupServiceArea,
  signupServiceDescription,
  signupExperienceYears,
  signupServiceId,
  categories,
  services,
  notice,
  busyAction,
  setEmail,
  setPassword,
  setSignupFullName,
  setSignupContactNumber,
  setSignupAddress,
  setSignupBusinessName,
  setSignupBirthdate,
  setSignupServiceArea,
  setSignupServiceDescription,
  setSignupExperienceYears,
  setSignupServiceId,
  navigate,
  signIn,
  signUp,
  requestPasswordReset,
  startGoogleSignIn,
}: AuthScreensProps) {
  const auth = useAuthViewModel();
  const { data, actions } = auth;
  const providerBirthdateMaxDate = getAdultBirthdateMaxDate();
  const [signupStep, setSignupStep] = useState(0);

  useEffect(() => {
    if (screen === 'customerRegistration' || screen === 'providerRegistration') {
      setSignupStep(0);
    }
  }, [screen]);

  if (screen === 'loginRole') {
    return <AuthRoleChoiceScreen mode="login" navigate={navigate} />;
  }

  if (screen === 'signupRole') {
    return (
      <AuthRoleChoiceScreen
        mode="signup"
        notice={notice}
        navigate={navigate}
      />
    );
  }

  if (screen === 'customerRegistration' || screen === 'providerRegistration') {
    return (
      <AuthRegistrationScreen
        screen={screen}
        signupStep={signupStep}
        providerBirthdateMaxDate={providerBirthdateMaxDate}
        email={email}
        password={password}
        signupFullName={signupFullName}
        signupContactNumber={signupContactNumber}
        signupAddress={signupAddress}
        signupBusinessName={signupBusinessName}
        signupBirthdate={signupBirthdate}
        signupServiceArea={signupServiceArea}
        signupServiceDescription={signupServiceDescription}
        signupExperienceYears={signupExperienceYears}
        signupServiceId={signupServiceId}
        categories={categories}
        services={services}
        notice={notice}
        busyAction={busyAction}
        setSignupStep={setSignupStep}
        setEmail={setEmail}
        setPassword={setPassword}
        setSignupFullName={setSignupFullName}
        setSignupContactNumber={setSignupContactNumber}
        setSignupAddress={setSignupAddress}
        setSignupBusinessName={setSignupBusinessName}
        setSignupBirthdate={setSignupBirthdate}
        setSignupServiceArea={setSignupServiceArea}
        setSignupServiceDescription={setSignupServiceDescription}
        setSignupExperienceYears={setSignupExperienceYears}
        setSignupServiceId={setSignupServiceId}
        navigate={navigate}
        signUp={signUp}
        startGoogleSignIn={startGoogleSignIn}
      />
    );
  }

  if (screen === 'customerLogin' || screen === 'providerLogin') {
    return (
      <AuthLoginScreen
        screen={screen}
        email={email}
        password={password}
        notice={notice}
        busyAction={busyAction}
        loginMethod={data.loginMethod}
        setLoginMethod={actions.setLoginMethod}
        setEmail={setEmail}
        setPassword={setPassword}
        navigate={navigate}
        signIn={signIn}
        requestPasswordReset={requestPasswordReset}
        startGoogleSignIn={startGoogleSignIn}
      />
    );
  }

  return <AuthGate navigate={navigate} />;
}

function getAdultBirthdateMaxDate(): string {
  const today = new Date();
  return formatApiDate(
    new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()),
  );
}
