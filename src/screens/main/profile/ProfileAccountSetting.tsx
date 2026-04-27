import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { typography } from '../../../theme/typography';
import { ProfileEditLayout } from './ProfileEditLayout';
import { logoutCandidate } from '../../../redux/slice/authSlice';
import { useNavigation } from '@react-navigation/native';
import { logoutToLogin } from './logoutToLogin';

const AccountSettingItem = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  rightElement,
  isDanger = false,
  colors 
}: any) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.item,
      { borderBottomColor: colors.border },
      pressed && !rightElement && { backgroundColor: colors.surfaceSecondary }
    ]}>
    <View style={styles.itemIconContainer}>
      <Icon name={icon} size={18} color={isDanger ? colors.error : colors.primary} />
    </View>
    <View style={styles.itemTextContainer}>
      <Text style={[typography.labelMedium, { color: isDanger ? colors.error : colors.textPrimary }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[typography.small, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
    {rightElement || <Icon name="chevron-right" size={12} color={colors.textPlaceholder} />}
  </Pressable>
);

const ProfileAccountSetting: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            // Static implementation: just logout for now
            try {
               await dispatch(logoutCandidate()).unwrap();
               logoutToLogin(navigation);
            } catch (e) {
               logoutToLogin(navigation);
            }
          }
        }
      ]
    );
  };

  return (
    <ProfileEditLayout
      title="Account Settings"
      subtitle="Manage your security, privacy and account status.">
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPlaceholder }]}>Security</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AccountSettingItem
            icon="lock"
            title="Change Password"
            subtitle="Secure your account with a new password"
            onPress={() => {}}
            colors={colors}
          />
          <AccountSettingItem
            icon="shield"
            title="Biometric Login"
            subtitle="Use Touch ID / Face ID"
            onPress={() => setBiometricsEnabled(!biometricsEnabled)}
            rightElement={
              <Switch 
                value={biometricsEnabled} 
                onValueChange={setBiometricsEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={biometricsEnabled ? colors.primary : colors.surfaceSecondary}
              />
            }
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPlaceholder }]}>Verification</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AccountSettingItem
            icon="envelope"
            title="Email Verification"
            subtitle={user?.email || "Verify your email address"}
            rightElement={
              <View style={[styles.badge, { backgroundColor: colors.successBackground }]}>
                <Text style={[styles.badgeText, { color: colors.success }]}>Verified</Text>
              </View>
            }
            colors={colors}
          />
          <AccountSettingItem
            icon="phone"
            title="Phone Verification"
            subtitle={user?.phone || "Link your mobile number"}
            onPress={() => {}}
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPlaceholder }]}>Privacy & Legal</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AccountSettingItem
            icon="file-text"
            title="Privacy Policy"
            onPress={() => {}}
            colors={colors}
          />
          <AccountSettingItem
            icon="legal"
            title="Terms of Service"
            onPress={() => {}}
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.error }]}>Danger Zone</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.error + '40' }]}>
          <AccountSettingItem
            icon="trash"
            title="Delete Account"
            subtitle="Permanently remove your account and data"
            onPress={handleDeleteAccount}
            isDanger={true}
            colors={colors}
          />
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
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  card: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemIconContainer: {
    width: 32,
    alignItems: 'center',
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default ProfileAccountSetting;
