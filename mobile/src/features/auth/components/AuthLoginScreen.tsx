import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type ImageStyle,
  type StyleProp,
} from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  KeyRound,
  Mail,
  UserRound,
} from 'lucide-react-native';
import { PhoneFrame } from '../../../components/DesignKit';
import { AppRole, AppScreen } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  authReferenceBrandMark,
  authReferenceDecorativePlate,
} from './authGateAssets';
import { AuthNotice } from './AuthShared';

type LoginMethod = 'email' | 'google';

const loginPlateAspectRatio =
  authReferenceDecorativePlate.intrinsicSize.width /
  authReferenceDecorativePlate.intrinsicSize.height;
const loginBrandMarkAspectRatio =
  authReferenceBrandMark.intrinsicSize.width /
  authReferenceBrandMark.intrinsicSize.height;
const loginPlateZoom = 1.02;
const loginPlateAnchorYRatio = 0.16;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildLoginPlateStyle(width: number, height: number): ImageStyle {
  const safeWidth = Math.max(width, 1);
  const safeHeight = Math.max(height, 1);
  const viewportAspectRatio = safeWidth / safeHeight;

  if (viewportAspectRatio > loginPlateAspectRatio) {
    const baseHeight = Math.ceil(safeWidth / loginPlateAspectRatio);
    const zoomedHeight = Math.ceil(baseHeight * loginPlateZoom);
    const zoomedWidth = Math.ceil(safeWidth * loginPlateZoom);
    const baseTop = (safeHeight - baseHeight) / 2;
    const anchorY = safeHeight * loginPlateAnchorYRatio;

    return {
      height: zoomedHeight,
      left: Math.round((safeWidth - zoomedWidth) / 2),
      top: Math.round(anchorY - (anchorY - baseTop) * loginPlateZoom),
      width: zoomedWidth,
    };
  }

  const baseWidth = Math.ceil(safeHeight * loginPlateAspectRatio);
  const zoomedHeight = Math.ceil(safeHeight * loginPlateZoom);
  const zoomedWidth = Math.ceil(baseWidth * loginPlateZoom);
  const baseLeft = (safeWidth - baseWidth) / 2;
  const anchorY = safeHeight * loginPlateAnchorYRatio;

  return {
    height: zoomedHeight,
    left: Math.round(baseLeft + (baseWidth - zoomedWidth) / 2),
    top: Math.round(anchorY - anchorY * loginPlateZoom),
    width: zoomedWidth,
  };
}

function LoginBrandMark({ width }: { width: number }) {
  return (
    <Image
      source={authReferenceBrandMark.source}
      style={{
        height: Math.round(width / loginBrandMarkAspectRatio),
        width,
      }}
      resizeMode="contain"
      accessible={false}
    />
  );
}

function LoginDecorations({ plateStyle }: { plateStyle: StyleProp<ImageStyle> }) {
  return (
    <View style={styles.decorations} pointerEvents="none" accessible={false}>
      <Image
        source={authReferenceDecorativePlate.source}
        style={[styles.referencePlate, plateStyle]}
        resizeMode="cover"
        accessible={false}
      />
    </View>
  );
}

function LoginField({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
}: {
  icon: 'email' | 'password';
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address';
}) {
  const Icon = icon === 'email' ? Mail : KeyRound;

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <Icon color={palette.mintDeep} size={18} strokeWidth={2.25} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(52,68,62,0.44)"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {icon === 'password' ? (
          <Eye color="rgba(52,68,62,0.42)" size={18} strokeWidth={2.2} />
        ) : null}
      </View>
    </View>
  );
}

export function AuthLoginScreen({
  screen,
  email,
  password,
  notice,
  busyAction,
  loginMethod,
  setLoginMethod,
  setEmail,
  setPassword,
  navigate,
  signIn,
  requestPasswordReset,
  startGoogleSignIn,
}: {
  screen: 'customerLogin' | 'providerLogin';
  email: string;
  password: string;
  notice: string;
  busyAction: string | null;
  loginMethod: LoginMethod;
  setLoginMethod: (method: LoginMethod) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  navigate: (screen: AppScreen, nextRole?: AppRole | null) => void;
  signIn: (role: AppRole) => Promise<void>;
  requestPasswordReset: () => Promise<void>;
  startGoogleSignIn: (role: AppRole, flow?: 'login' | 'registration') => Promise<void>;
}) {
  const { height, width } = useWindowDimensions();
  const intendedRole: AppRole = screen === 'providerLogin' ? 'provider' : 'customer';
  const isProvider = intendedRole === 'provider';
  const RoleIcon = isProvider ? BriefcaseBusiness : UserRound;
  const plateStyle = buildLoginPlateStyle(width, height);
  const markWidth = clamp(width * 0.16, 62, 74);
  const panelWidth = clamp(width - 44, 324, 358);

  return (
    <PhoneFrame>
      <View style={styles.screen}>
        <LoginDecorations plateStyle={plateStyle} />
        <Pressable
          style={styles.backButton}
          onPress={() => navigate('loginRole', null)}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ArrowLeft color={palette.ink} size={22} strokeWidth={2.4} />
        </Pressable>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <LoginBrandMark width={markWidth} />
            <View style={styles.rolePill}>
              <RoleIcon color={palette.mintDeep} size={15} strokeWidth={2.4} />
              <Text style={styles.rolePillText}>
                {isProvider ? 'Provider workspace' : 'Customer account'}
              </Text>
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              {isProvider
                ? 'Manage bookings, availability, and provider work.'
                : 'Book services and manage your ServEase requests.'}
            </Text>
          </View>

          <View style={[styles.panel, { width: panelWidth }]}>
            <View style={styles.methodTabs}>
              {(['email', 'google'] as const).map((method) => (
                <Pressable
                  key={method}
                  style={[
                    styles.methodTab,
                    loginMethod === method && styles.methodTabSelected,
                    busyAction !== null && styles.methodTabBusy,
                  ]}
                  onPress={() => setLoginMethod(method)}
                  disabled={busyAction !== null}
                  accessibilityRole="button"
                  accessibilityLabel={`Use ${method === 'email' ? 'email' : 'Google'} login`}
                  accessibilityState={{
                    disabled: busyAction !== null,
                    selected: loginMethod === method,
                  }}
                >
                  {method === 'email' ? (
                    <Mail
                      color={loginMethod === method ? palette.mintDeep : palette.muted}
                      size={15}
                      strokeWidth={2.4}
                    />
                  ) : (
                    <Text style={styles.googleMark}>G</Text>
                  )}
                  <Text
                    style={[
                      styles.methodTabText,
                      loginMethod === method && styles.methodTabTextSelected,
                    ]}
                  >
                    {method === 'email' ? 'Email' : 'Google'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {loginMethod === 'email' ? (
              <View style={styles.form}>
                <LoginField
                  icon="email"
                  label="Email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  placeholder="you@example.com"
                />
                <LoginField
                  icon="password"
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Enter your password"
                />
                <Pressable
                  style={styles.forgotButton}
                  onPress={() => void requestPasswordReset()}
                  disabled={busyAction === 'password-reset'}
                  accessibilityRole="button"
                  accessibilityLabel="Send password reset link"
                  accessibilityState={{ disabled: busyAction === 'password-reset' }}
                >
                  <Text style={styles.forgotText}>
                    {busyAction === 'password-reset'
                      ? 'Sending reset link...'
                      : 'Forgot password?'}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.googlePanel}>
                <Text style={styles.googlePanelTitle}>Use your Google account</Text>
                <Text style={styles.googlePanelBody}>
                  Continue through APICenter to access your ServEase workspace.
                </Text>
              </View>
            )}
          </View>

          <Pressable
            style={[styles.primaryButton, { width: panelWidth - 46 }]}
            onPress={() =>
              loginMethod === 'email'
                ? void signIn(intendedRole)
                : void startGoogleSignIn(intendedRole)
            }
            disabled={busyAction !== null}
            accessibilityRole="button"
            accessibilityLabel={
              loginMethod === 'email' ? 'Log in' : 'Continue with Google'
            }
            accessibilityState={{ disabled: busyAction !== null }}
          >
            <View style={styles.primaryIconSpacer} />
            <Text style={styles.primaryText}>
              {loginMethod === 'email'
                ? busyAction === 'sign-in'
                  ? 'Logging in...'
                  : 'Log in'
                : busyAction === 'google-auth'
                  ? 'Opening Google...'
                  : 'Continue with Google'}
            </Text>
            <View style={styles.primaryIcon}>
              <ArrowRight color={palette.white} size={24} strokeWidth={2.15} />
            </View>
          </Pressable>

          <Pressable
            style={styles.secondaryLink}
            onPress={() => navigate('signupRole', null)}
            accessibilityRole="button"
            accessibilityLabel="Create an account"
          >
            <Text style={styles.secondaryText}>Create an account</Text>
          </Pressable>

          <AuthNotice notice={notice} />
        </ScrollView>
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.white,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  decorations: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  referencePlate: {
    position: 'absolute',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.74)',
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    left: spacing.base,
    position: 'absolute',
    top: 58,
    width: 42,
    zIndex: 2,
  },
  scroll: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
    flexGrow: 1,
    paddingBottom: 34,
    paddingHorizontal: spacing.lg,
    paddingTop: 150,
  },
  hero: {
    alignItems: 'center',
    gap: 14,
    width: '100%',
  },
  rolePill: {
    alignItems: 'center',
    backgroundColor: 'rgba(239,250,244,0.86)',
    borderColor: 'rgba(0,160,85,0.18)',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    minHeight: 34,
    paddingHorizontal: 13,
  },
  rolePillText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  title: {
    color: '#123B2C',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 36,
    marginTop: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#51615B',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    marginTop: -6,
    maxWidth: 292,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: 'rgba(15,70,48,0.12)',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 3,
    gap: 18,
    marginTop: 34,
    padding: 14,
    shadowColor: '#113C2B',
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
  },
  methodTabs: {
    backgroundColor: 'rgba(229,247,237,0.72)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  methodTab: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 40,
  },
  methodTabSelected: {
    backgroundColor: palette.white,
    shadowColor: '#113C2B',
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  methodTabBusy: {
    opacity: 0.7,
  },
  methodTabText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  methodTabTextSelected: {
    color: palette.mintDeep,
  },
  googleMark: {
    color: '#4285F4',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 19,
  },
  form: {
    gap: 13,
  },
  field: {
    gap: 7,
  },
  fieldLabel: {
    color: '#34443E',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,251,249,0.96)',
    borderColor: 'rgba(15,70,48,0.1)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  input: {
    color: palette.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
    minWidth: 0,
    paddingVertical: 0,
  },
  forgotButton: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 32,
  },
  forgotText: {
    color: palette.mintDeep,
    fontSize: 12.5,
    fontWeight: '800',
    lineHeight: 17,
  },
  googlePanel: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,251,249,0.96)',
    borderColor: 'rgba(15,70,48,0.1)',
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    minHeight: 112,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  googlePanelTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
    textAlign: 'center',
  },
  googlePanelBody: {
    color: palette.muted,
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 18,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#3F9E63',
    borderRadius: radius.pill,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    minHeight: 52,
    paddingHorizontal: 20,
    shadowColor: palette.mintDeep,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  primaryIconSpacer: {
    width: 32,
  },
  primaryIcon: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  primaryText: {
    color: palette.white,
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    textAlign: 'center',
  },
  secondaryLink: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    minHeight: 44,
    paddingHorizontal: spacing.base,
  },
  secondaryText: {
    color: palette.mintDeep,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
});
