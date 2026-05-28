import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { typography } from '../../../theme/typography';
import { ProfileEditLayout } from './ProfileEditLayout';
import { PrimaryButton } from '../../../components/auth';
import { useToast } from '../../../context/ToastContext';
import { useTranslation } from 'react-i18next';

// Enable layout animation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface FAQItemProps {
  question: string;
  answer: string;
  colors: any;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, colors }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <Pressable
      onPress={toggleExpand}
      style={[
        styles.faqContainer,
        {
          backgroundColor: colors.surface,
          borderColor: expanded ? colors.primary + '60' : colors.border,
        },
      ]}
    >
      <View style={styles.faqHeader}>
        <Text style={[typography.labelMedium, { color: colors.textPrimary, flex: 1, paddingRight: spacing.sm }]}>
          {question}
        </Text>
        <View style={[styles.arrowCircle, { backgroundColor: expanded ? colors.primary + '10' : colors.surfaceHighlight }]}>
          <Icon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={expanded ? colors.primary : colors.textPlaceholder}
          />
        </View>
      </View>
      {expanded && (
        <View style={[styles.faqAnswerContainer, { borderTopColor: colors.border }]}>
          <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 21 }]}>
            {answer}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

interface ContactRowProps {
  icon: string;
  title: string;
  value: string;
  badge: string;
  color: string;
  onPress: () => void;
  colors: any;
}

const ContactRow: React.FC<ContactRowProps> = ({ icon, title, value, badge, color, onPress, colors }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.contactRow,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        pressed && { backgroundColor: colors.surfaceHighlight },
      ]}
    >
      <View style={[styles.contactIconWrap, { backgroundColor: color + '12' }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={styles.contactDetails}>
        <Text style={[typography.small, { color: colors.textPlaceholder }]}>{title}</Text>
        <Text style={[typography.labelMedium, { color: colors.textPrimary, marginTop: 2, fontWeight: 'bold' }]}>
          {value}
        </Text>
      </View>
      <View style={[styles.contactBadge, { backgroundColor: color + '0B' }]}>
        <Text style={[styles.contactBadgeText, { color: color }]}>{badge}</Text>
      </View>
      <Icon name="chevron-right" size={14} color={colors.textPlaceholder} style={{ marginLeft: spacing.xs }} />
    </Pressable>
  );
};

const HelpAndSupportScreen: React.FC = () => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { t } = useTranslation();

  // Form State
  const [category, setCategory] = useState('application');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus States for Inputs
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isMessageFocused, setIsMessageFocused] = useState(false);

  const handleContactPress = (type: 'email' | 'phone' | 'whatsapp') => {
    if (type === 'email') {
      Linking.openURL('mailto:support@jobindia.in?subject=Job%20India%20Support%20Request');
    } else if (type === 'phone') {
      Linking.openURL('tel:+9118001234567');
    } else if (type === 'whatsapp') {
      Linking.openURL('https://wa.me/919876543210?text=Hello%20Job%20India%20Support%21');
    }
  };

  const handleSubmitTicket = () => {
    if (!message.trim() || !email.trim()) {
      showToast(t('helpAndSupportScreen.validationError', 'Please fill in both Email and Message fields.'), 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail('');
      setMessage('');
      Alert.alert(
        t('helpAndSupportScreen.ticketSubmittedTitle', 'Ticket Submitted'),
        t('helpAndSupportScreen.ticketSubmittedMsg', 'Thank you for reaching out! A support ticket has been created. Our team will contact you back at your email within 24 hours.'),
        [{ text: 'OK' }]
      );
    }, 1500);
  };

  const faqData = [
    {
      question: t('helpAndSupportScreen.faq1Q', 'How do I apply for a job?'),
      answer: t('helpAndSupportScreen.faq1A', 'Browse jobs on the Home or Jobs tab. Click on a job to view its details, fill in any screening answers requested by the employer, and click "Apply now". You can track the status of all your applications in the "Applications" tab.'),
    },
    {
      question: t('helpAndSupportScreen.faq2Q', 'How does the AI Resume Builder work?'),
      answer: t('helpAndSupportScreen.faq2A', 'Navigate to the AI Assistant screen from your profile or the main dashboard. Our AI parses your personal and professional profile details, formats it professionally, and suggests high-impact keywords to beat Applicant Tracking Systems (ATS).'),
    },
    {
      question: t('helpAndSupportScreen.faq3Q', 'How can I edit my job preferences?'),
      answer: t('helpAndSupportScreen.faq3A', 'Go to your Profile tab, click "View Profile Details", and click on the edit icon next to "Job Preferences". There, you can update your preferred roles, locations, industry, and expected salary to get better recommendations.'),
    },
    {
      question: t('helpAndSupportScreen.faq4Q', 'What do the application status labels mean?'),
      answer: t('helpAndSupportScreen.faq4A', '"Under Review" means the recruiter is actively viewing your resume. "Shortlisted" means you advanced to the next screening round, and a representative will contact you shortly. "Rejected" means the application is closed.'),
    },
    {
      question: t('helpAndSupportScreen.faq5Q', 'Is my personal data protected on Job India?'),
      answer: t('helpAndSupportScreen.faq5A', 'Yes, absolutely. We use industry-standard encryption protocols. Your personal contact details are kept secure and are only revealed to verified recruiters to protect you from fraudulent activities or spam.'),
    },
  ];

  const categories = [
    { label: t('helpAndSupportScreen.categoryJobApply', 'Job Apply'), val: 'application' },
    { label: t('helpAndSupportScreen.categoryAiResume', 'AI Resume'), val: 'resume' },
    { label: t('helpAndSupportScreen.categoryAccount', 'Account'), val: 'account' },
    { label: t('helpAndSupportScreen.categoryOther', 'Other'), val: 'other' },
  ];

  return (
    <ProfileEditLayout
      title={t('helpAndSupportScreen.title', 'Help & Support')}
      subtitle={t('helpAndSupportScreen.subtitle', 'Find quick answers, contact our team, or submit a support request ticket.')}
    >
      {/* Quick Contacts */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPlaceholder }]}>
          {t('helpAndSupportScreen.getInTouch', 'Get in Touch')}
        </Text>
        <View style={styles.contactsColumn}>
          <ContactRow
            icon="mail"
            title={t('helpAndSupportScreen.emailSupport', 'Email Support')}
            value="support@jobindia.in"
            badge={t('helpAndSupportScreen.emailReplies', 'Replies in 4h')}
            color="#3B82F6"
            onPress={() => handleContactPress('email')}
            colors={colors}
          />
          <ContactRow
            icon="phone"
            title={t('helpAndSupportScreen.tollFreeCall', 'Toll Free Call')}
            value="1800-123-4567"
            badge={t('helpAndSupportScreen.tollFreeHours', '9 AM - 6 PM')}
            color="#10B981"
            onPress={() => handleContactPress('phone')}
            colors={colors}
          />
          <ContactRow
            icon="message-circle"
            title={t('helpAndSupportScreen.whatsappSupport', 'WhatsApp Support')}
            value="+91 98765 43210"
            badge={t('helpAndSupportScreen.whatsappInstant', 'Instant Chat')}
            color="#8B5CF6"
            onPress={() => handleContactPress('whatsapp')}
            colors={colors}
          />
        </View>
      </View>

      {/* Frequently Asked Questions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPlaceholder }]}>
          {t('helpAndSupportScreen.faqTitle', 'Frequently Asked Questions')}
        </Text>
        <View style={styles.faqList}>
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              colors={colors}
            />
          ))}
        </View>
      </View>

      {/* Submit Ticket Form */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPlaceholder }]}>
          {t('helpAndSupportScreen.submitTicket', 'Submit a Support Ticket')}
        </Text>
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('helpAndSupportScreen.emailLabel', 'Your Registered Email Address')}
            </Text>
            <View style={[
              styles.inputWrapper, 
              { 
                backgroundColor: colors.surfaceHighlight, 
                borderColor: isEmailFocused ? colors.primary : colors.border,
                borderWidth: isEmailFocused ? 1.5 : 1,
              }
            ]}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                placeholder={t('helpAndSupportScreen.emailPlaceholder', 'Enter email address')}
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('helpAndSupportScreen.categoryLabel', 'Issue Category')}
            </Text>
            <View style={styles.categoriesRow}>
              {categories.map(cat => (
                <Pressable
                  key={cat.val}
                  onPress={() => setCategory(cat.val)}
                  style={[
                    styles.catBadge,
                    {
                      backgroundColor: category === cat.val ? colors.primary + '15' : colors.surfaceHighlight,
                      borderColor: category === cat.val ? colors.primary : colors.border,
                    }
                  ]}
                >
                  <Text style={[typography.small, { color: category === cat.val ? colors.primary : colors.textSecondary, fontWeight: 'bold' }]}>
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('helpAndSupportScreen.descriptionLabel', 'Description of the issue')}
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surfaceHighlight,
                  borderColor: isMessageFocused ? colors.primary : colors.border,
                  borderWidth: isMessageFocused ? 1.5 : 1,
                  color: colors.textPrimary,
                },
              ]}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              onFocus={() => setIsMessageFocused(true)}
              onBlur={() => setIsMessageFocused(false)}
              placeholder={t('helpAndSupportScreen.descriptionPlaceholder', 'Describe your query or issue in detail...')}
              placeholderTextColor={colors.textPlaceholder}
            />
          </View>

          <View style={{ marginTop: spacing.sm }}>
            <PrimaryButton
              title={isSubmitting
                ? t('helpAndSupportScreen.submittingBtn', 'Submitting...')
                : t('helpAndSupportScreen.submitBtn', 'Submit Support Request')
              }
              onPress={handleSubmitTicket}
              loading={isSubmitting}
              colors={colors}
            />
          </View>

        </View>
      </View>
    </ProfileEditLayout>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  contactsColumn: {
    gap: spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.md,
  },
  contactIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  contactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  contactBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faqList: {
    gap: spacing.sm,
  },
  faqContainer: {
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  faqAnswerContainer: {
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    ...typography.small,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    overflow: 'hidden',
    height: 48,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  textArea: {
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 14,
    height: 90,
    textAlignVertical: 'top',
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  catBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HelpAndSupportScreen;
