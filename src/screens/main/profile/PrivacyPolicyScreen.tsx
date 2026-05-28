import React from 'react';
import { StyleSheet, Text, View, Linking, Pressable } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { typography } from '../../../theme/typography';
import { ProfileEditLayout } from './ProfileEditLayout';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

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

const PrivacyPolicyScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ProfileEditLayout
      title={t('privacyPolicyScreen.title', 'Privacy Policy')}
      subtitle={t('privacyPolicyScreen.lastUpdated', 'Last updated: May 19, 2026')}
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        
        {/* Intro */}
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          {t('privacyPolicyScreen.intro1', 'This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.')}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          {t('privacyPolicyScreen.intro2', 'We use Your Personal Data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.')}
        </Text>

        <SectionDivider colors={colors} />

        {/* Interpretation & Definitions */}
        <Text style={[styles.h2, { color: colors.primary }]}>{t('privacyPolicyScreen.section1Title', '1. Interpretation and Definitions')}</Text>
        
        <Text style={[styles.h3, { color: colors.textPrimary }]}>{t('privacyPolicyScreen.interpretationTitle', 'Interpretation')}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          {t('privacyPolicyScreen.interpretationText', 'The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.')}
        </Text>

        <Text style={[styles.h3, { color: colors.textPrimary }]}>{t('privacyPolicyScreen.definitionsTitle', 'Definitions')}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          {t('privacyPolicyScreen.definitionsText', 'For the purposes of this Privacy Policy:')}
        </Text>

        <View style={styles.bulletList}>
          <BulletItem
            strongText={t('privacyPolicyScreen.defAccountStrong', 'Account ')}
            normalText={t('privacyPolicyScreen.defAccountText', 'means a unique account created for You to access our Service or parts of our Service.')}
            colors={colors}
          />
          <BulletItem
            strongText={t('privacyPolicyScreen.defAffiliateStrong', 'Affiliate ')}
            normalText={t('privacyPolicyScreen.defAffiliateText', "means an entity that controls, is controlled by, or is under common control with a party, where 'control' means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.")}
            colors={colors}
          />
          <BulletItem
            strongText={t('privacyPolicyScreen.defApplicationStrong', 'Application ')}
            normalText={t('privacyPolicyScreen.defApplicationText', 'refers to Job India, the software program provided by the Company.')}
            colors={colors}
          />
          <BulletItem
            strongText={t('privacyPolicyScreen.defCompanyStrong', 'Company ')}
            normalText={t('privacyPolicyScreen.defCompanyText', "(referred to as either 'the Company', 'We', 'Us' or 'Our' in this Privacy Policy) refers to Job India.")}
            colors={colors}
          />
          <BulletItem
            strongText={t('privacyPolicyScreen.defCountryStrong', 'Country ')}
            normalText={t('privacyPolicyScreen.defCountryText', 'refers to: Maharashtra, India.')}
            colors={colors}
          />
          <BulletItem
            strongText={t('privacyPolicyScreen.defDeviceStrong', 'Device ')}
            normalText={t('privacyPolicyScreen.defDeviceText', 'means any device that can access the Service such as a computer, a cell phone or a digital tablet.')}
            colors={colors}
          />
          <BulletItem
            strongText={t('privacyPolicyScreen.defPersonalDataStrong', 'Personal Data ')}
            normalText={t('privacyPolicyScreen.defPersonalDataText', 'is any information that relates to an identified or identifiable individual.')}
            colors={colors}
          />
          <BulletItem
            strongText={t('privacyPolicyScreen.defServiceStrong', 'Service ')}
            normalText={t('privacyPolicyScreen.defServiceText', 'refers to the Application.')}
            colors={colors}
          />
          <BulletItem
            strongText={t('privacyPolicyScreen.defServiceProviderStrong', 'Service Provider ')}
            normalText={t('privacyPolicyScreen.defServiceProviderText', 'means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.')}
            colors={colors}
          />
          <BulletItem
            strongText={t('privacyPolicyScreen.defUsageDataStrong', 'Usage Data ')}
            normalText={t('privacyPolicyScreen.defUsageDataText', 'refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).')}
            colors={colors}
          />
          <BulletItem
            strongText={t('privacyPolicyScreen.defYouStrong', 'You ')}
            normalText={t('privacyPolicyScreen.defYouText', 'means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.')}
            colors={colors}
          />
        </View>

        <SectionDivider colors={colors} />

        {/* Collecting & Using Personal Data */}
        <Text style={[styles.h2, { color: colors.primary }]}>{t('privacyPolicyScreen.section2Title', '2. Collecting and Using Your Personal Data')}</Text>
        
        <Text style={[styles.h3, { color: colors.textPrimary }]}>{t('privacyPolicyScreen.typesOfDataCollectedTitle', 'Types of Data Collected')}</Text>
        
        <Text style={[styles.h4, { color: colors.textPrimary }]}>{t('privacyPolicyScreen.personalDataSubTitle', 'Personal Data')}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          {t('privacyPolicyScreen.personalDataText', 'While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:')}
        </Text>
        <View style={styles.bulletList}>
          <BulletItem strongText={t('privacyPolicyScreen.emailAddressStrong', 'Email address')} normalText="" colors={colors} />
          <BulletItem strongText={t('privacyPolicyScreen.phoneNumberStrong', 'Phone number')} normalText="" colors={colors} />
        </View>

        <Text style={[styles.h4, { color: colors.textPrimary, marginTop: spacing.md }]}>{t('privacyPolicyScreen.usageDataSubTitle', 'Usage Data')}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          {t('privacyPolicyScreen.usageDataText1', 'Usage Data is collected automatically when using the Service.')}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          {t('privacyPolicyScreen.usageDataText2', "Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.")}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          {t('privacyPolicyScreen.usageDataText3', "When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device's unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.")}
        </Text>

        <Text style={[styles.h4, { color: colors.textPrimary, marginTop: spacing.md }]}>{t('privacyPolicyScreen.infoCollectedAppTitle', 'Information Collected while Using the Application')}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          {t('privacyPolicyScreen.infoCollectedAppText', 'While using Our Application, in order to provide features of Our Application, We may collect, with Your prior permission:')}
        </Text>
        <View style={styles.bulletList}>
          <BulletItem strongText={t('privacyPolicyScreen.cameraPhotosStrong', 'Camera & Photos: ')} normalText={t('privacyPolicyScreen.cameraPhotosText', "Pictures and other information from your Device's camera and photo library for updating profile pictures or uploading resumes.")} colors={colors} />
        </View>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginTop: spacing.sm, marginBottom: spacing.md }]}>
          {t('privacyPolicyScreen.infoCollectedAppUsageText', 'We use this information to provide features of Our Service, to improve and customize Our Service. You can enable or disable access to this information at any time through Your Device settings.')}
        </Text>

        <SectionDivider colors={colors} />

        {/* Use of Personal Data */}
        <Text style={[styles.h3, { color: colors.textPrimary }]}>{t('privacyPolicyScreen.useOfPersonalDataTitle', 'Use of Your Personal Data')}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          {t('privacyPolicyScreen.useOfPersonalDataText', 'The Company may use Personal Data for the following purposes:')}
        </Text>

        <View style={styles.bulletList}>
          <BulletItem strongText={t('privacyPolicyScreen.useMaintainStrong', 'To maintain our Service: ')} normalText={t('privacyPolicyScreen.useMaintainText', 'Including monitoring application metrics.')} colors={colors} />
          <BulletItem strongText={t('privacyPolicyScreen.useManageStrong', 'To manage Your Account: ')} normalText={t('privacyPolicyScreen.useManageText', 'To handle candidate profiles and login authentication.')} colors={colors} />
          <BulletItem strongText={t('privacyPolicyScreen.useContractStrong', 'For contract performance: ')} normalText={t('privacyPolicyScreen.useContractText', 'Complying with general terms of employment services.')} colors={colors} />
          <BulletItem strongText={t('privacyPolicyScreen.useContactStrong', 'To contact You: ')} normalText={t('privacyPolicyScreen.useContactText', 'By email, telephone, SMS, or app push notifications.')} colors={colors} />
          <BulletItem strongText={t('privacyPolicyScreen.useUpdatesStrong', 'To provide updates: ')} normalText={t('privacyPolicyScreen.useUpdatesText', 'To share relevant job recommendations and notification alerts.')} colors={colors} />
          <BulletItem strongText={t('privacyPolicyScreen.useRequestsStrong', 'To manage requests: ')} normalText={t('privacyPolicyScreen.useRequestsText', 'To attend and coordinate support inquiries.')} colors={colors} />
        </View>

        <SectionDivider colors={colors} />

        {/* Retention of Data */}
        <Text style={[styles.h3, { color: colors.textPrimary }]}>{t('privacyPolicyScreen.retentionTitle', 'Retention of Your Personal Data')}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          {t('privacyPolicyScreen.retentionText', 'The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example, if We are required to retain Your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.')}
        </Text>
        <View style={styles.bulletList}>
          <BulletItem strongText={t('privacyPolicyScreen.retUserAccountsStrong', 'User Accounts: ')} normalText={t('privacyPolicyScreen.retUserAccountsText', 'Retained for the duration of your account relationship plus up to 24 months after account closure.')} colors={colors} />
          <BulletItem strongText={t('privacyPolicyScreen.retSupportTicketsStrong', 'Support Tickets: ')} normalText={t('privacyPolicyScreen.retSupportTicketsText', 'Up to 24 months from the date of ticket closure for quality tracking.')} colors={colors} />
          <BulletItem strongText={t('privacyPolicyScreen.retUsageStatisticsStrong', 'Usage statistics: ')} normalText={t('privacyPolicyScreen.retUsageStatisticsText', 'Up to 24 months for adoption analytics.')} colors={colors} />
        </View>

        <SectionDivider colors={colors} />

        {/* Security */}
        <Text style={[styles.h3, { color: colors.textPrimary }]}>{t('privacyPolicyScreen.securityTitle', 'Security of Your Personal Data')}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          {t('privacyPolicyScreen.securityText', 'The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.')}
        </Text>

        <SectionDivider colors={colors} />

        {/* Contact Us */}
        <Text style={[styles.h2, { color: colors.primary }]}>{t('privacyPolicyScreen.section3Title', '3. Contact Us')}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md }]}>
          {t('privacyPolicyScreen.contactUsText', 'If you have any questions about this Privacy Policy, You can contact us:')}
        </Text>
        
        <Pressable
          onPress={() => handleLinkPress('tel:+919988888888')}
          style={({ pressed }) => [
            styles.contactBtn,
            { backgroundColor: colors.surfaceHighlight, borderColor: colors.border },
            pressed && { backgroundColor: colors.border },
          ]}
        >
          <Icon name="phone" size={16} color={colors.primary} style={{ marginRight: spacing.sm }} />
          <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>
            {t('privacyPolicyScreen.callUsBtnText', 'Call Us: +91 99888 88888')}
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
  h4: {
    ...typography.labelMedium,
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: 6,
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

export default PrivacyPolicyScreen;