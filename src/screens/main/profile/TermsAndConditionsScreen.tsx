import React from 'react';
import { StyleSheet, Text, View, Linking, Pressable } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { typography } from '../../../theme/typography';
import { ProfileEditLayout } from './ProfileEditLayout';
import Icon from 'react-native-vector-icons/Feather';

interface BulletItemProps {
  strongText: string;
  normalText: string;
  colors: any;
}

const BulletItem: React.FC<BulletItemProps> = ({ strongText, normalText, colors }) => (
  <View style={styles.bulletRow}>
    <Text style={[styles.bulletDot, { color: colors.primary }]}>{"\u2022"}</Text>
    <View style={styles.bulletContent}>
      <Text style={[typography.body, { color: colors.textPrimary, lineHeight: 20 }]}>
        <Text style={{ fontWeight: 'bold' }}>{strongText}</Text>
        {normalText}
      </Text>
    </View>
  </View>
);

const SectionDivider: React.FC<{ colors: any }> = ({ colors }) => (
  <View style={[styles.divider, { backgroundColor: colors.border }]} />
);

const TermsAndConditionsScreen: React.FC = () => {
  const { colors } = useTheme();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ProfileEditLayout
      title="Terms & Conditions"
      subtitle="Last updated: May 19, 2026"
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        
        {/* Intro */}
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          Please read these terms and conditions carefully before using Our Service.
        </Text>

        <SectionDivider colors={colors} />

        {/* Interpretation & Definitions */}
        <Text style={[styles.h2, { color: colors.primary }]}>1. Interpretation and Definitions</Text>
        
        <Text style={[styles.h3, { color: colors.textPrimary }]}>Interpretation</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
        </Text>

        <Text style={[styles.h3, { color: colors.textPrimary }]}>Definitions</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          For the purposes of these Terms and Conditions:
        </Text>

        <View style={styles.bulletList}>
          <BulletItem
            strongText="Application "
            normalText="means the software program provided by the Company downloaded by You on any electronic device, named Job India."
            colors={colors}
          />
          <BulletItem
            strongText="Application Store "
            normalText="means the digital distribution service operated and developed by Apple Inc. (Apple App Store) or Google Inc. (Google Play Store) in which the Application has been downloaded."
            colors={colors}
          />
          <BulletItem
            strongText="Affiliate "
            normalText="means an entity that controls, is controlled by, or is under common control with a party, where 'control' means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority."
            colors={colors}
          />
          <BulletItem
            strongText="Country "
            normalText="refers to: Maharashtra, India."
            colors={colors}
          />
          <BulletItem
            strongText="Company "
            normalText="(referred to as either 'the Company', 'We', 'Us' or 'Our' in these Terms and Conditions) refers to Job India."
            colors={colors}
          />
          <BulletItem
            strongText="Device "
            normalText="means any device that can access the Service such as a computer, a cell phone or a digital tablet."
            colors={colors}
          />
          <BulletItem
            strongText="Service "
            normalText="refers to the Application."
            colors={colors}
          />
          <BulletItem
            strongText="Terms and Conditions "
            normalText="(also referred to as 'Terms') means these Terms and Conditions, including any documents expressly incorporated by reference, which govern Your access to and use of the Service and form the entire agreement between You and the Company regarding the Service."
            colors={colors}
          />
          <BulletItem
            strongText="Third-Party Social Media Service "
            normalText="means any services or content (including data, information, products or services) provided by a third party that is displayed, included, made available, or linked to through the Service."
            colors={colors}
          />
          <BulletItem
            strongText="You "
            normalText="means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable."
            colors={colors}
          />
        </View>

        <SectionDivider colors={colors} />

        {/* Acknowledgment */}
        <Text style={[styles.h2, { color: colors.primary }]}>2. Acknowledgment</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          These are the Terms and Conditions governing the use of this Service and the agreement between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.
        </Text>

        <SectionDivider colors={colors} />

        {/* Links to Other Websites */}
        <Text style={[styles.h2, { color: colors.primary }]}>3. Links to Other Websites</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          Our Service may contain links to third-party websites or services that are not owned or controlled by the Company.
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such websites or services.
        </Text>

        <SectionDivider colors={colors} />

        {/* Termination */}
        <Text style={[styles.h2, { color: colors.primary }]}>4. Termination</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          Upon termination, Your right to use the Service will cease immediately.
        </Text>

        <SectionDivider colors={colors} />

        {/* Limitation of Liability */}
        <Text style={[styles.h2, { color: colors.primary }]}>5. Limitation of Liability</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of these Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.
        </Text>

        <SectionDivider colors={colors} />

        {/* Disclaimer */}
        <Text style={[styles.h2, { color: colors.primary }]}>6. Disclaimer</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise.
        </Text>

        <SectionDivider colors={colors} />

        {/* Contact Us */}
        <Text style={[styles.h2, { color: colors.primary }]}>7. Contact Us</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          If you have any questions about these Terms and Conditions, You can contact us:
        </Text>
        
        <Pressable
          onPress={() => handleLinkPress('tel:+919987767899')}
          style={({ pressed }) => [
            styles.contactBtn,
            { backgroundColor: colors.surfaceHighlight, borderColor: colors.border },
            pressed && { backgroundColor: colors.border },
          ]}
        >
          <Icon name="phone" size={16} color={colors.primary} style={{ marginRight: spacing.sm }} />
          <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>
            Call Us: +91 99877 67899
          </Text>
        </Pressable>

      </View>
    </ProfileEditLayout>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
  },
  h2: {
    ...typography.h4,
    fontWeight: '800',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  h3: {
    ...typography.labelLarge,
    fontWeight: 'bold',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.lg,
    opacity: 0.3,
  },
  bulletList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontSize: 16,
    lineHeight: 18,
    marginRight: spacing.sm,
    width: 8,
    textAlign: 'center',
  },
  bulletContent: {
    flex: 1,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
});

export default TermsAndConditionsScreen;