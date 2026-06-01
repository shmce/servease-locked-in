import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { PhoneFrame } from '../../../components/DesignKit';
import { AppRole, AppScreen } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';

const authReferenceFrame = require('../../../../assets/auth/auth-reference-frame-v2.png');

export function AuthGate({
  navigate,
}: {
  navigate: (screen: AppScreen, nextRole?: AppRole | null) => void;
}) {
  return (
    <PhoneFrame>
      <View style={styles.authGate}>
        <Image
          source={authReferenceFrame}
          style={styles.authGateFrame}
          resizeMode="stretch"
          accessible={false}
        />
        <ScrollView
          contentContainerStyle={styles.authGateContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authGateBrandBlock}>
            <View style={styles.authGateMark} pointerEvents="none">
              <View style={styles.authGateMarkHouse}>
                <View style={styles.authGateMarkPin} />
                <View style={styles.authGateMarkHole} />
              </View>
            </View>
            <Text
              style={styles.authGateLogoText}
              accessibilityRole="header"
              accessibilityLabel="ServEase"
            >
              <Text style={styles.authGateLogoServ}>serv</Text>
              <Text style={styles.authGateLogoEase}>ease</Text>
            </Text>
            <Text style={styles.authGateTagline}>
              Finding and connecting with trusted local professionals around you.
            </Text>
          </View>

          <View style={styles.authGateActions}>
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

          <Text style={styles.authGateFooter}>
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
  authGateFrame: {
    bottom: 0,
    height: '100%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
  authGateContent: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'space-between',
    minHeight: 700,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: 178,
  },
  authGateBrandBlock: {
    alignItems: 'center',
    gap: spacing.lg,
    maxWidth: 304,
    width: '86%',
  },
  authGateMark: {
    alignItems: 'center',
    height: 96,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    width: 118,
  },
  authGateMarkHouse: {
    alignItems: 'center',
    borderColor: palette.mint,
    borderRadius: 24,
    borderWidth: 16,
    height: 78,
    justifyContent: 'center',
    shadowColor: '#113C2B',
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.13,
    shadowRadius: 14,
    transform: [{ rotate: '45deg' }],
    width: 78,
  },
  authGateMarkPin: {
    backgroundColor: palette.mint,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    height: 59,
    position: 'absolute',
    top: 22,
    transform: [{ rotate: '-45deg' }],
    width: 47,
  },
  authGateMarkHole: {
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    height: 22,
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
    width: 22,
  },
  authGateLogoText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 60,
    textAlign: 'center',
  },
  authGateLogoServ: {
    color: palette.mint,
  },
  authGateLogoEase: {
    color: '#103C2C',
  },
  authGateTagline: {
    color: '#34443E',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    maxWidth: 286,
    textAlign: 'center',
  },
  authGateActions: {
    gap: spacing.md,
    maxWidth: 320,
    width: '86%',
  },
  authGateSignupButton: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
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
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 23,
    maxWidth: 300,
    paddingTop: spacing.xl,
    textAlign: 'center',
  },
  authGateFooterStrong: {
    fontWeight: '900',
  },
});
