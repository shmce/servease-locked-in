import { PhoneFrame, StatusStrip, TopBar } from '../../../components/DesignKit';
import { AppRole, AppScreen } from '../../../navigation/types';
import {
  AuthContent,
  AuthHeader,
  AuthNotice,
  AuthOptionCard,
  AuthOptionStack,
} from './AuthShared';

type AuthRoleChoiceScreenProps = {
  mode: 'login' | 'signup';
  notice?: string;
  navigate: (screen: AppScreen, nextRole?: AppRole | null) => void;
};

export function AuthRoleChoiceScreen({
  mode,
  notice = '',
  navigate,
}: AuthRoleChoiceScreenProps) {
  const isSignup = mode === 'signup';

  return (
    <PhoneFrame>
      <StatusStrip />
      <TopBar
        title={isSignup ? 'Sign up' : 'Log in'}
        subtitle={
          isSignup
            ? 'Start with the account that fits what you want to do.'
            : 'Pick the account type you use with ServEase.'
        }
        onBack={() => navigate('authGate', null)}
      />
      <AuthContent>
        <AuthHeader
          eyebrow={isSignup ? 'Create your account' : 'Welcome back'}
          title={isSignup ? 'What brings you here?' : 'Continue as'}
          body={
            isSignup
              ? 'Customers can book help right away. Providers can create a profile and complete approval steps after joining.'
              : 'Choose the right workspace so your bookings, jobs, and settings open in the right place.'
          }
        />
        <AuthOptionStack>
          <AuthOptionCard
            icon="customer"
            title={isSignup ? 'Book a service' : 'Customer'}
            body={
              isSignup
                ? 'Create a customer account for home and everyday service requests.'
                : 'Book trusted local services and manage your requests.'
            }
            meta={isSignup ? 'Customer account' : 'Find and book services'}
            onPress={() =>
              navigate(isSignup ? 'customerRegistration' : 'customerLogin', 'customer')
            }
          />
          <AuthOptionCard
            icon="provider"
            title={isSignup ? 'Offer services' : 'Service Provider'}
            body={
              isSignup
                ? 'Create a provider profile for bookings, availability, and customer work.'
                : 'Review bookings, manage work, and serve customers.'
            }
            meta={isSignup ? 'Provider account' : 'Offer services'}
            onPress={() =>
              navigate(isSignup ? 'providerRegistration' : 'providerLogin', 'provider')
            }
          />
        </AuthOptionStack>
        {isSignup ? <AuthNotice notice={notice} /> : null}
      </AuthContent>
    </PhoneFrame>
  );
}
