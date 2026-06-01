import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ImageStyle,
  type StyleProp,
} from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Home,
} from 'lucide-react-native';
import { PhoneFrame } from '../../../components/DesignKit';
import { AppRole, AppScreen } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  authReferenceBrandMark,
  authReferenceDecorativePlate,
} from './authGateAssets';
import { AuthNotice } from './AuthShared';

type AuthRoleChoiceScreenProps = {
  mode: 'login' | 'signup';
  notice?: string;
  navigate: (screen: AppScreen, nextRole?: AppRole | null) => void;
};

const rolePlateAspectRatio =
  authReferenceDecorativePlate.intrinsicSize.width /
  authReferenceDecorativePlate.intrinsicSize.height;
const roleBrandMarkAspectRatio =
  authReferenceBrandMark.intrinsicSize.width /
  authReferenceBrandMark.intrinsicSize.height;
const rolePlateZoom = 1.02;
const rolePlateAnchorYRatio = 0.16;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildRolePlateStyle(width: number, height: number): ImageStyle {
  const safeWidth = Math.max(width, 1);
  const safeHeight = Math.max(height, 1);
  const viewportAspectRatio = safeWidth / safeHeight;

  if (viewportAspectRatio > rolePlateAspectRatio) {
    const baseHeight = Math.ceil(safeWidth / rolePlateAspectRatio);
    const zoomedHeight = Math.ceil(baseHeight * rolePlateZoom);
    const zoomedWidth = Math.ceil(safeWidth * rolePlateZoom);
    const baseTop = (safeHeight - baseHeight) / 2;
    const anchorY = safeHeight * rolePlateAnchorYRatio;

    return {
      height: zoomedHeight,
      left: Math.round((safeWidth - zoomedWidth) / 2),
      top: Math.round(anchorY - (anchorY - baseTop) * rolePlateZoom),
      width: zoomedWidth,
    };
  }

  const baseWidth = Math.ceil(safeHeight * rolePlateAspectRatio);
  const zoomedHeight = Math.ceil(safeHeight * rolePlateZoom);
  const zoomedWidth = Math.ceil(baseWidth * rolePlateZoom);
  const baseLeft = (safeWidth - baseWidth) / 2;
  const anchorY = safeHeight * rolePlateAnchorYRatio;

  return {
    height: zoomedHeight,
    left: Math.round(baseLeft + (baseWidth - zoomedWidth) / 2),
    top: Math.round(anchorY - anchorY * rolePlateZoom),
    width: zoomedWidth,
  };
}

function RoleBrandMark({ width }: { width: number }) {
  return (
    <Image
      source={authReferenceBrandMark.source}
      style={{
        height: Math.round(width / roleBrandMarkAspectRatio),
        width,
      }}
      resizeMode="contain"
      accessible={false}
    />
  );
}

function RoleDecorations({ plateStyle }: { plateStyle: StyleProp<ImageStyle> }) {
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

function RoleOptionCard({
  role,
  selected,
  title,
  body,
  onPress,
}: {
  role: AppRole;
  selected: boolean;
  title: string;
  body: string;
  onPress: () => void;
}) {
  const isCustomer = role === 'customer';

  return (
    <Pressable
      style={[styles.roleCard, selected && styles.roleCardSelected]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityHint={body}
      accessibilityState={{ selected }}
    >
      <View style={[styles.roleIconSurface, selected && styles.roleIconSurfaceSelected]}>
        {isCustomer ? (
          <Home
            color={selected ? palette.mintDark : palette.mintDeep}
            size={30}
            strokeWidth={2.35}
          />
        ) : (
          <BriefcaseBusiness
            color={selected ? palette.mintDark : palette.mintDeep}
            size={30}
            strokeWidth={2.35}
          />
        )}
      </View>
      <View style={styles.roleCopy}>
        <Text style={styles.roleTitle}>{title}</Text>
        <Text
          style={styles.roleBody}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.86}
        >
          {body}
        </Text>
      </View>
      <View style={[styles.selectionMark, selected && styles.selectionMarkSelected]}>
        {selected ? (
          <Check color={palette.white} size={17} strokeWidth={3.2} />
        ) : null}
      </View>
    </Pressable>
  );
}

export function AuthRoleChoiceScreen({
  mode,
  notice = '',
  navigate,
}: AuthRoleChoiceScreenProps) {
  const { height, width } = useWindowDimensions();
  const [selectedRole, setSelectedRole] = useState<AppRole>('customer');
  const isSignup = mode === 'signup';
  const plateStyle = buildRolePlateStyle(width, height);
  const cardWidth = clamp(width - 44, 324, 358);
  const markWidth = clamp(width * 0.17, 66, 78);

  const continueScreen: AppScreen =
    selectedRole === 'customer'
      ? isSignup
        ? 'customerRegistration'
        : 'customerLogin'
      : isSignup
        ? 'providerRegistration'
        : 'providerLogin';

  return (
    <PhoneFrame>
      <View style={styles.screen}>
        <RoleDecorations plateStyle={plateStyle} />
        <Pressable
          style={styles.backButton}
          onPress={() => navigate('authGate', null)}
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
            <RoleBrandMark width={markWidth} />
            <Text style={styles.title}>Choose your role</Text>
            <Text style={styles.subtitle}>
              Tell us how you want to use ServEase.
            </Text>
          </View>

          <View style={[styles.roleStack, { width: cardWidth }]} accessibilityRole="radiogroup">
            <RoleOptionCard
              role="customer"
              selected={selectedRole === 'customer'}
              title="Customer"
              body="Book trusted local professionals"
              onPress={() => setSelectedRole('customer')}
            />
            <RoleOptionCard
              role="provider"
              selected={selectedRole === 'provider'}
              title="Provider"
              body="Offer services and manage jobs"
              onPress={() => setSelectedRole('provider')}
            />
          </View>

          <Pressable
            style={[styles.continueButton, { width: cardWidth - 46 }]}
            onPress={() => navigate(continueScreen, selectedRole)}
            accessibilityRole="button"
            accessibilityLabel={`Continue as ${selectedRole}`}
          >
            <View style={styles.continueIconSpacer} />
            <Text style={styles.continueText}>Continue</Text>
            <View style={styles.continueIcon}>
              <ArrowRight color={palette.white} size={24} strokeWidth={2.15} />
            </View>
          </Pressable>

          <Pressable
            style={styles.secondaryLink}
            onPress={() => navigate(isSignup ? 'loginRole' : 'signupRole', null)}
            accessibilityRole="button"
            accessibilityLabel={isSignup ? 'I already have an account' : 'Create an account'}
          >
            <Text style={styles.secondaryText}>
              {isSignup ? 'I already have an account' : 'Create an account'}
            </Text>
          </Pressable>

          {isSignup ? <AuthNotice notice={notice} /> : null}
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
    paddingTop: 158,
  },
  hero: {
    alignItems: 'center',
    gap: 14,
    width: '100%',
  },
  title: {
    color: '#123B2C',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 33,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: '#51615B',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    marginTop: -6,
    textAlign: 'center',
  },
  roleStack: {
    gap: 14,
    marginTop: 34,
  },
  roleCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderColor: 'rgba(15,70,48,0.12)',
    borderRadius: 22,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    gap: 14,
    minHeight: 92,
    paddingLeft: 14,
    paddingRight: 48,
    paddingVertical: 13,
    position: 'relative',
    shadowColor: '#113C2B',
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
  },
  roleCardSelected: {
    backgroundColor: 'rgba(239,250,244,0.96)',
    borderColor: 'rgba(0,160,85,0.58)',
  },
  roleIconSurface: {
    alignItems: 'center',
    backgroundColor: 'rgba(229,247,237,0.9)',
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    position: 'relative',
    width: 56,
  },
  roleIconSurfaceSelected: {
    backgroundColor: 'rgba(255,255,255,0.86)',
  },
  roleCopy: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  roleTitle: {
    color: '#123B2C',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 23,
  },
  roleBody: {
    color: '#53645D',
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
  },
  selectionMark: {
    alignItems: 'center',
    borderColor: 'rgba(0,160,85,0.78)',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 15,
    top: 32,
    width: 28,
  },
  selectionMarkSelected: {
    backgroundColor: '#3FA76B',
    borderColor: '#3FA76B',
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: '#3F9E63',
    borderRadius: radius.pill,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    minHeight: 52,
    paddingHorizontal: 20,
    shadowColor: palette.mintDeep,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  continueIconSpacer: {
    width: 32,
  },
  continueIcon: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  continueText: {
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
