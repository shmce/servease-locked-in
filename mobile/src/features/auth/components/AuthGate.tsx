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
import { ArrowRight } from 'lucide-react-native';
import { PhoneFrame } from '../../../components/DesignKit';
import { AppRole, AppScreen } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  authReferenceBrandMark,
  authReferenceDecorativePlate,
  authReferenceWordmark,
} from './authGateAssets';

const authGatePlateAspectRatio =
  authReferenceDecorativePlate.intrinsicSize.width /
  authReferenceDecorativePlate.intrinsicSize.height;
const authGateBrandMarkAspectRatio =
  authReferenceBrandMark.intrinsicSize.width /
  authReferenceBrandMark.intrinsicSize.height;
const authGateWordmarkAspectRatio =
  authReferenceWordmark.intrinsicSize.width /
  authReferenceWordmark.intrinsicSize.height;

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

function AuthGateBrandMark({ width }: { width: number }) {
  const height = Math.round(width / authGateBrandMarkAspectRatio);

  return (
    <Image
      source={authReferenceBrandMark.source}
      style={[styles.authGateBrandMarkImage, { height, width }]}
      resizeMode="contain"
      accessible={false}
    />
  );
}

function AuthGateWordmark({ width }: { width: number }) {
  const height = Math.round(width / authGateWordmarkAspectRatio);

  return (
    <View
      style={styles.authGateWordmark}
      accessibilityRole="header"
      accessibilityLabel="ServEase"
    >
      <Image
        source={authReferenceWordmark.source}
        style={[styles.authGateWordmarkImage, { height, width }]}
        resizeMode="contain"
        accessible={false}
      />
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
  const brandMarkWidth = clamp(width * 0.22, 88, 100);
  const wordmarkWidth = clamp(width * 0.708, 292, 324);
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
              <AuthGateBrandMark width={brandMarkWidth} />
            </View>
            <AuthGateWordmark width={wordmarkWidth} />
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
    gap: 20,
    maxWidth: 340,
    width: '88%',
  },
  authGateMark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  authGateBrandMarkImage: {
    alignSelf: 'center',
  },
  authGateWordmark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  authGateWordmarkImage: {
    alignSelf: 'center',
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
