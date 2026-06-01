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
  type ViewStyle,
} from 'react-native';
import { ArrowRight, Cog } from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { PhoneFrame } from '../../../components/DesignKit';
import { AppRole, AppScreen } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { authReferenceDecorativePlate } from './authGateAssets';

const authGatePlateAspectRatio =
  authReferenceDecorativePlate.intrinsicSize.width /
  authReferenceDecorativePlate.intrinsicSize.height;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildAuthGatePlateStyle(
  viewportWidth: number,
  viewportHeight: number,
): ImageStyle {
  const width = Math.max(viewportWidth, 1);
  const height = Math.max(viewportHeight, 1);
  const viewportAspectRatio = width / height;

  if (viewportAspectRatio > authGatePlateAspectRatio) {
    const plateHeight = Math.ceil(width / authGatePlateAspectRatio);

    return {
      height: plateHeight,
      left: 0,
      top: Math.round((height - plateHeight) / 2),
      width,
    };
  }

  const plateWidth = Math.ceil(height * authGatePlateAspectRatio);

  return {
    height,
    left: Math.round((width - plateWidth) / 2),
    top: 0,
    width: plateWidth,
  };
}

function buildAuthGateContentStyle(viewportHeight: number): ViewStyle {
  const height = Math.max(viewportHeight, 720);

  return {
    minHeight: height,
    paddingBottom: clamp(height * 0.095, 78, 102),
    paddingTop: clamp(height * 0.24, 188, 232),
  };
}

function AuthGateDecorations({ plateStyle }: { plateStyle: StyleProp<ImageStyle> }) {
  return (
    <View
      style={styles.authGateDecorations}
      pointerEvents="none"
      accessible={false}
      testID="auth-gate-reference-plate"
    >
      <Image
        source={authReferenceDecorativePlate.source}
        style={[styles.authGateReferencePlate, plateStyle]}
        resizeMode="cover"
        accessible={false}
      />
    </View>
  );
}

function AuthGateBrandMark() {
  return (
    <Svg height={106} width={104} viewBox="0 0 104 106" pointerEvents="none">
      <Path
        d="M18 57V43.2c0-5.3 2.4-10.2 6.4-13.4L43.9 14c4.8-3.9 11.6-3.9 16.4 0l19.5 15.8c4 3.2 6.4 8.1 6.4 13.4v31.4c0 6.3-5.1 11.4-11.4 11.4H68"
        fill="none"
        stroke={palette.mint}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={12}
      />
      <Path
        d="M52 39.5c-14.6 0-26.5 11.8-26.5 26.3C25.5 86 52 103 52 103s26.5-17 26.5-37.2c0-14.5-11.9-26.3-26.5-26.3Z"
        fill={palette.mint}
      />
      <Circle cx={52} cy={65.6} fill={palette.white} r={9.8} />
    </Svg>
  );
}

function AuthGateWordmark() {
  return (
    <View
      style={styles.authGateWordmark}
      accessibilityRole="header"
      accessibilityLabel="ServEase"
    >
      <Text style={[styles.authGateLogoText, styles.authGateLogoServ]}>s</Text>
      <View style={styles.authGateGearLetter} accessible={false}>
        <Cog color={palette.mint} size={31} strokeWidth={3.6} />
      </View>
      <Text style={[styles.authGateLogoText, styles.authGateLogoServ]}>rv</Text>
      <Text style={[styles.authGateLogoText, styles.authGateLogoEase]}>ease</Text>
    </View>
  );
}

export function AuthGate({
  navigate,
}: {
  navigate: (screen: AppScreen, nextRole?: AppRole | null) => void;
}) {
  const { height, width } = useWindowDimensions();
  const plateStyle = buildAuthGatePlateStyle(width, height);
  const contentStyle = buildAuthGateContentStyle(height);
  const actionWidth = clamp(width - 72, 288, 338);
  const copyWidth = clamp(width - 80, 276, 314);
  const footerWidth = clamp(width - 80, 280, 310);

  return (
    <PhoneFrame>
      <View style={styles.authGate}>
        <AuthGateDecorations plateStyle={plateStyle} />
        <ScrollView
          style={styles.authGateScroll}
          contentContainerStyle={[styles.authGateContent, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authGateBrandBlock}>
            <View style={styles.authGateMark} pointerEvents="none">
              <AuthGateBrandMark />
            </View>
            <AuthGateWordmark />
            <Text style={[styles.authGateTagline, { maxWidth: copyWidth }]}>
              Finding and connecting with trusted local professionals around you.
            </Text>
          </View>

          <View style={[styles.authGateActions, { width: actionWidth }]}>
            <Pressable
              style={styles.authGateSignupButton}
              onPress={() => navigate('signupRole', null)}
              accessibilityRole="button"
              accessibilityLabel="Sign up for ServEase"
            >
              <Text style={styles.authGateSignupText}>Sign up for ServEase</Text>
              <ArrowRight color={palette.white} size={27} strokeWidth={2.2} />
            </Pressable>

            <Pressable
              style={styles.authGateLoginButton}
              onPress={() => navigate('loginRole', null)}
              accessibilityRole="button"
              accessibilityLabel="Log in"
            >
              <Text style={styles.authGateLoginText}>Log in</Text>
              <ArrowRight color={palette.mintDeep} size={27} strokeWidth={2.2} />
            </Pressable>
          </View>

          <Text style={[styles.authGateFooter, { maxWidth: footerWidth }]}>
            <Text>Quality work. Trusted professionals.{'\n'}</Text>
            <Text style={styles.authGateFooterStrong}>Right where you need them.</Text>
          </Text>
        </ScrollView>
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  authGate: {
    backgroundColor: palette.white,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  authGateDecorations: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  authGateReferencePlate: {
    position: 'absolute',
  },
  authGateScroll: {
    flex: 1,
    zIndex: 1,
  },
  authGateContent: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    transform: [{ translateX: -27 }],
  },
  authGateBrandBlock: {
    alignItems: 'center',
    gap: 18,
    maxWidth: 340,
    width: '88%',
  },
  authGateMark: {
    alignItems: 'center',
    height: 112,
    justifyContent: 'center',
    marginBottom: 8,
    width: 118,
  },
  authGateWordmark: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  authGateLogoText: {
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 60,
    textAlign: 'center',
  },
  authGateGearLetter: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    marginHorizontal: -1,
    marginTop: 7,
    width: 34,
  },
  authGateLogoServ: {
    color: palette.mint,
  },
  authGateLogoEase: {
    color: '#103C2C',
  },
  authGateTagline: {
    color: '#34443E',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 25,
    marginTop: 6,
    textAlign: 'center',
  },
  authGateActions: {
    gap: spacing.md,
    marginTop: 54,
  },
  authGateSignupButton: {
    alignItems: 'center',
    backgroundColor: '#2FA967',
    borderRadius: radius.pill,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingLeft: spacing.xxl,
    paddingRight: spacing.xl,
    shadowColor: palette.mintDeep,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  authGateSignupText: {
    color: palette.white,
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
    textAlign: 'center',
  },
  authGateLoginButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: palette.mintDeep,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingLeft: spacing.xxl,
    paddingRight: spacing.xl,
  },
  authGateLoginText: {
    color: palette.mintDeep,
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
    textAlign: 'center',
  },
  authGateFooter: {
    color: '#36594B',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    marginTop: 'auto',
    paddingTop: spacing.xl,
    textAlign: 'center',
  },
  authGateFooterStrong: {
    fontWeight: '900',
  },
});
