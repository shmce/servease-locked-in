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
const authGatePlateZoom = 1.025;
const authGatePlateAnchorYRatio = 0.2;

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

    const baseTop = (height - plateHeight) / 2;
    const zoomedHeight = Math.ceil(plateHeight * authGatePlateZoom);
    const zoomedWidth = Math.ceil(width * authGatePlateZoom);
    const anchorY = height * authGatePlateAnchorYRatio;

    return {
      height: zoomedHeight,
      left: Math.round((width - zoomedWidth) / 2),
      top: Math.round(anchorY - (anchorY - baseTop) * authGatePlateZoom),
      width: zoomedWidth,
    };
  }

  const plateWidth = Math.ceil(height * authGatePlateAspectRatio);
  const zoomedHeight = Math.ceil(height * authGatePlateZoom);
  const zoomedWidth = Math.ceil(plateWidth * authGatePlateZoom);
  const baseLeft = (width - plateWidth) / 2;
  const anchorY = height * authGatePlateAnchorYRatio;

  return {
    height: zoomedHeight,
    left: Math.round(baseLeft + (plateWidth - zoomedWidth) / 2),
    top: Math.round(anchorY - anchorY * authGatePlateZoom),
    width: zoomedWidth,
  };
}

function buildAuthGateContentStyle(viewportHeight: number): ViewStyle {
  const height = Math.max(viewportHeight, 720);

  return {
    minHeight: height,
    paddingBottom: clamp(height * 0.095, 78, 108),
    paddingTop: clamp(height * 0.246, 190, 234),
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
  const actionWidth = clamp(width - 76, 286, 340);
  const brandMarkWidth = clamp(width * 0.208, 84, 96);
  const wordmarkWidth = clamp(width * 0.682, 280, 312);
  const copyWidth = clamp(width - 116, 244, 282);
  const footerWidth = clamp(width - 126, 236, 270);

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
              <ArrowRight color={palette.white} size={24} strokeWidth={2.1} />
            </Pressable>

            <Pressable
              style={styles.authGateLoginButton}
              onPress={() => navigate('loginRole', null)}
              accessibilityRole="button"
              accessibilityLabel="Log in"
            >
              <Text style={styles.authGateLoginText}>Log in</Text>
              <ArrowRight color={palette.mintDeep} size={24} strokeWidth={2.1} />
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
    gap: 18,
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
    fontSize: 14.5,
    fontWeight: '400',
    lineHeight: 22,
    marginTop: 2,
    textAlign: 'center',
  },
  authGateActions: {
    gap: 12,
    marginTop: 42,
  },
  authGateSignupButton: {
    alignItems: 'center',
    backgroundColor: '#3D9D62',
    borderRadius: radius.pill,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingLeft: 28,
    paddingRight: 20,
    shadowColor: palette.mintDeep,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
  },
  authGateSignupText: {
    color: palette.white,
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
    lineHeight: 21,
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
    minHeight: 52,
    paddingLeft: 28,
    paddingRight: 20,
  },
  authGateLoginText: {
    color: palette.mintDeep,
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
    lineHeight: 21,
    textAlign: 'center',
  },
  authGateFooter: {
    color: '#36594B',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    marginTop: 'auto',
    paddingBottom: 20,
    paddingTop: 14,
    textAlign: 'center',
  },
  authGateFooterStrong: {
    fontWeight: '700',
  },
});
