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
    paddingBottom: clamp(height * 0.145, 116, 150),
    paddingTop: clamp(height * 0.235, 180, 222),
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
    <Svg height={96} width={94} viewBox="0 0 104 106" pointerEvents="none">
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
        <Cog color={palette.mint} size={28} strokeWidth={3.4} />
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
  const actionWidth = clamp(width - 88, 280, 324);
  const copyWidth = clamp(width - 94, 258, 296);
  const footerWidth = clamp(width - 100, 260, 288);

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
  },
  authGateBrandBlock: {
    alignItems: 'center',
    gap: 16,
    maxWidth: 340,
    width: '88%',
  },
  authGateMark: {
    alignItems: 'center',
    height: 98,
    justifyContent: 'center',
    marginBottom: 6,
    width: 104,
  },
  authGateWordmark: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  authGateLogoText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 54,
    textAlign: 'center',
  },
  authGateGearLetter: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    marginHorizontal: -1,
    marginTop: 6,
    width: 31,
  },
  authGateLogoServ: {
    color: palette.mint,
  },
  authGateLogoEase: {
    color: '#103C2C',
  },
  authGateTagline: {
    color: '#34443E',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    marginTop: 6,
    textAlign: 'center',
  },
  authGateActions: {
    gap: 11,
    marginTop: 46,
  },
  authGateSignupButton: {
    alignItems: 'center',
    backgroundColor: '#2FA967',
    borderRadius: radius.pill,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingLeft: 30,
    paddingRight: 22,
    shadowColor: palette.mintDeep,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  authGateSignupText: {
    color: palette.white,
    flex: 1,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
    textAlign: 'center',
  },
  authGateLoginButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.mintDeep,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingLeft: 30,
    paddingRight: 22,
  },
  authGateLoginText: {
    color: palette.mintDeep,
    flex: 1,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
    textAlign: 'center',
  },
  authGateFooter: {
    color: '#36594B',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 'auto',
    paddingTop: spacing.xl,
    textAlign: 'center',
  },
  authGateFooterStrong: {
    fontWeight: '900',
  },
});
