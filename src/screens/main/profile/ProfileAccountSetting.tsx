import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Switch,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../redux/store';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { typography } from '../../../theme/typography';
import { ProfileEditLayout } from './ProfileEditLayout';
import { logoutCandidate, logout } from '../../../redux/slice/authSlice';
import { changePassword, deleteAccount, clearProfile } from '../../../redux/slice/profileSlice';
import { useNavigation } from '@react-navigation/native';
import { logoutToLogin } from './logoutToLogin';
import { PrimaryButton } from '../../../components/auth';
import { useToast } from '../../../context/ToastContext';

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
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  // Change Password State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Consolidated Password Visibility State
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Custom Alert/Status/Confirmation Modal State
  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: 'error' as 'error' | 'success' | 'confirm',
    title: '',
    message: '',
    onConfirm: () => { },
  });

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  const [delLoading, setDelLoading] = useState(false);
  const [showDelPwd, setShowDelPwd] = useState(false);

  const confirmPasswordError = confirmPassword && newPassword && confirmPassword !== newPassword
    ? 'Passwords do not match'
    : '';

  // Animated values for custom premium slide-up sheets
  const changePasswordSlideAnim = React.useRef(new Animated.Value(350)).current;
  const deleteAccountSlideAnim = React.useRef(new Animated.Value(350)).current;

  React.useEffect(() => {
    if (showPasswordModal) {
      changePasswordSlideAnim.setValue(350);
      Animated.spring(changePasswordSlideAnim, {
        toValue: 0,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
  }, [showPasswordModal]);

  React.useEffect(() => {
    if (showDeleteModal) {
      deleteAccountSlideAnim.setValue(350);
      Animated.spring(deleteAccountSlideAnim, {
        toValue: 0,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
  }, [showDeleteModal]);

  const showStatus = (type: 'error' | 'success' | 'confirm', title: string, message: string, onConfirm?: () => void) => {
    setStatusModal({ visible: true, type, title, message, onConfirm: onConfirm || (() => { }) });
  };

  const toggleVisibility = (field: 'current' | 'new' | 'confirm') => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev?.[field]
    }));
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      showStatus('error', 'Validation Error', 'Please enter your current password.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      showStatus('error', 'Validation Error', 'Please enter and confirm your new password.');
      return;
    }

    // New password field validations
    const errors: string[] = [];
    if (newPassword.length < 8) {
      errors.push('• Must be at least 8 characters long.');
    }
    if (!/[A-Z]/.test(newPassword)) {
      errors.push('• Must contain at least one uppercase letter (A-Z).');
    }
    if (!/[a-z]/.test(newPassword)) {
      errors.push('• Must contain at least one lowercase letter (a-z).');
    }
    if (!/[0-9]/.test(newPassword)) {
      errors.push('• Must contain at least one number (0-9).');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      errors.push('• Must contain at least one special character.');
    }
    if (/(.)\1{2,}/.test(newPassword)) {
      errors.push('• Must not contain 3 or more consecutive identical characters.');
    }

    if (errors.length > 0) {
      showStatus('error', 'Weak Password', `Your new password does not meet the requirements:\n${errors.join('\n')}`);
      return;
    }

    if (newPassword !== confirmPassword) {
      showStatus('error', 'Validation Error', 'New password and confirm password do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      await dispatch(changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      })).unwrap();

      showStatus(
        'success',
        'Success',
        'Password changed successfully. Please log in again with your new password.',
        () => {
          dispatch(logout());
          dispatch(clearProfile());
          logoutToLogin(navigation);
        }
      );
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      let errorMessage = err.message || "Failed to change password";
      if (err.errors) {
        // Prioritize current_password error if present
        if (err.errors.current_password) {
          errorMessage = err.errors.current_password.join("\n• ");
        } else {
          const errorList = Object.values(err.errors).flat();
          errorMessage = errorList.join("\n• ");
        }
      }
      showStatus('error', 'Change Failed', errorMessage);
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletePassword || !deleteReason) {
      showStatus('error', 'Required Fields', 'Please enter your password and a reason for leaving.');
      return;
    }

    setDelLoading(true);
    try {
      await dispatch(deleteAccount({
        password: deletePassword,
        deletion_reason: deleteReason
      })).unwrap();

      // Successfully deleted, now logout locally (don't call logout API as account is gone)
      dispatch(logout());
      dispatch(clearProfile());
      setShowDeleteModal(false);
      showToast('Account deleted successfully', 'success');
      logoutToLogin(navigation);
    } catch (err: any) {
      let errorMessage = err.message || "Failed to delete account";
      if (err.errors) {
        const errorList = Object.values(err.errors).flat();
        errorMessage = errorList.join("\n• ");
      }
      showStatus('error', 'Deletion Failed', errorMessage);
    } finally {
      setDelLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    showStatus(
      'confirm',
      'Delete Account',
      'Are you sure you want to delete your account? This action is permanent and cannot be undone.',
      () => {
        setStatusModal(prev => ({ ...prev, visible: false }));
        setShowDeleteModal(true);
      }
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
            onPress={() => setShowPasswordModal(true)}
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
            onPress={() => navigation.navigate('PrivacyPolicy')}
            colors={colors}
          />
          <AccountSettingItem
            icon="file-text"
            title="Terms of Service"
            onPress={() => navigation.navigate('TermsAndConditions')}
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

      <Modal
        visible={showPasswordModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowPasswordModal(false)} />
          <Animated.View style={[styles.modalContainer, { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, spacing.md), transform: [{ translateY: changePasswordSlideAnim }] }]}>
            <View style={styles.modalHeader}>
              <Text style={[typography.h3, { color: colors.textPrimary }]}>Change Password</Text>
              <Pressable onPress={() => setShowPasswordModal(false)} hitSlop={12}>
                <Icon name="x" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Current Password</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    secureTextEntry={!passwordVisibility?.current}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor={colors.textPlaceholder}
                  />
                  <Pressable onPress={() => toggleVisibility('current')} style={styles.eyeIcon}>
                    <Icon name={passwordVisibility?.current ? "eye" : "eye-off"} size={18} color={colors.textPlaceholder} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>New Password</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    secureTextEntry={!passwordVisibility?.new}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.textPlaceholder}
                  />
                  <Pressable onPress={() => toggleVisibility('new')} style={styles.eyeIcon}>
                    <Icon name={passwordVisibility?.new ? "eye" : "eye-off"} size={18} color={colors.textPlaceholder} />
                  </Pressable>
                </View>
                {newPassword.length > 0 && (
                  <View style={styles.requirementsContainer}>
                    <View style={styles.requirementRow}>
                      <Icon
                        name={newPassword.length >= 8 ? "check-circle" : "circle"}
                        size={14}
                        color={newPassword.length >= 8 ? colors.success : colors.textPlaceholder}
                      />
                      <Text style={[styles.requirementText, { color: newPassword.length >= 8 ? colors.textPrimary : colors.textSecondary }]}>
                        At least 8 characters
                      </Text>
                    </View>
                    <View style={styles.requirementRow}>
                      <Icon
                        name={(/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) ? "check-circle" : "circle"}
                        size={14}
                        color={(/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) ? colors.success : colors.textPlaceholder}
                      />
                      <Text style={[styles.requirementText, { color: (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) ? colors.textPrimary : colors.textSecondary }]}>
                        At least one uppercase & lowercase letter
                      </Text>
                    </View>
                    <View style={styles.requirementRow}>
                      <Icon
                        name={(/[0-9]/.test(newPassword) && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) ? "check-circle" : "circle"}
                        size={14}
                        color={(/[0-9]/.test(newPassword) && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) ? colors.success : colors.textPlaceholder}
                      />
                      <Text style={[styles.requirementText, { color: (/[0-9]/.test(newPassword) && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) ? colors.textPrimary : colors.textSecondary }]}>
                        At least one number & special character
                      </Text>
                    </View>
                    <View style={styles.requirementRow}>
                      <Icon
                        name={(!/(.)\1{2,}/.test(newPassword)) ? "check-circle" : "x-circle"}
                        size={14}
                        color={(!/(.)\1{2,}/.test(newPassword)) ? colors.success : colors.error}
                      />
                      <Text style={[styles.requirementText, { color: (!/(.)\1{2,}/.test(newPassword)) ? colors.textPrimary : colors.error }]}>
                        No 3+ consecutive identical characters
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Confirm New Password</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    secureTextEntry={!passwordVisibility?.confirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.textPlaceholder}
                  />
                  <Pressable onPress={() => toggleVisibility('confirm')} style={styles.eyeIcon}>
                    <Icon name={passwordVisibility?.confirm ? "eye" : "eye-off"} size={18} color={colors.textPlaceholder} />
                  </Pressable>
                </View>
                {confirmPasswordError ? (
                  <Text style={styles.errorText}>
                    {confirmPasswordError}
                  </Text>
                ) : null}
              </View>

              <View style={{ marginTop: spacing.md }}>
                <PrimaryButton
                  title={pwdLoading ? "Updating..." : "Update Password"}
                  onPress={handleChangePassword}
                  loading={pwdLoading}
                  colors={colors}
                />
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowDeleteModal(false)} />
          <Animated.View style={[styles.modalContainer, { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, spacing.md), transform: [{ translateY: deleteAccountSlideAnim }] }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[typography.h3, { color: colors.error }]}>Delete Account</Text>
                <Text style={[typography.small, { color: colors.textSecondary }]}>This action cannot be undone</Text>
              </View>
              <Pressable onPress={() => setShowDeleteModal(false)} hitSlop={12}>
                <Icon name="x" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Confirm Password</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    secureTextEntry={!showDelPwd}
                    value={deletePassword}
                    onChangeText={setDeletePassword}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textPlaceholder}
                  />
                  <Pressable onPress={() => setShowDelPwd(!showDelPwd)} style={styles.eyeIcon}>
                    <Icon name={showDelPwd ? "eye" : "eye-off"} size={18} color={colors.textPlaceholder} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Reason for leaving</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, color: colors.textPrimary, height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                  multiline
                  numberOfLines={3}
                  value={deleteReason}
                  onChangeText={setDeleteReason}
                  placeholder="Tell us why you are leaving..."
                  placeholderTextColor={colors.textPlaceholder}
                />
              </View>

              <View style={{ marginTop: spacing.md }}>
                <TouchableOpacity
                  onPress={handleDeleteConfirm}
                  disabled={delLoading}
                  style={[styles.deleteBtn, { backgroundColor: colors.error }]}
                >
                  {delLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Permanently Delete My Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Status/Confirmation Modal */}
      <Modal
        visible={statusModal.visible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.statusOverlay}>
          <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statusIcon, { backgroundColor: statusModal.type === 'success' ? colors.success + '20' : statusModal.type === 'confirm' ? colors.error + '10' : colors.error + '20' }]}>
              <Icon
                name={statusModal.type === 'success' ? "check-circle" : statusModal.type === 'confirm' ? "trash-2" : "alert-circle"}
                size={32}
                color={statusModal.type === 'success' ? colors.success : colors.error}
              />
            </View>
            <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: 8 }]}>{statusModal.title}</Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }]}>{statusModal.message}</Text>

            {statusModal.type === 'confirm' ? (
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  onPress={() => setStatusModal(prev => ({ ...prev, visible: false }))}
                  style={[styles.statusBtnSmall, { backgroundColor: colors.surfaceSecondary }]}
                >
                  <Text style={[typography.labelMedium, { color: colors.textPrimary }]}>No, Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={statusModal.onConfirm}
                  style={[styles.statusBtnSmall, { backgroundColor: colors.error }]}
                >
                  <Text style={[typography.labelMedium, { color: '#fff' }]}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setStatusModal(prev => ({ ...prev, visible: false }));
                  if (statusModal.onConfirm) {
                    statusModal.onConfirm();
                  }
                }}
                style={[styles.statusBtn, { backgroundColor: statusModal.type === 'success' ? colors.success : colors.primary }]}
              >
                <Text style={[typography.labelMedium, { color: '#fff' }]}>Got it</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  eyeIcon: {
    paddingHorizontal: spacing.md,
    height: 48,
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 2,
  },
  requirementsContainer: {
    marginTop: spacing.sm,
    gap: 6,
    paddingHorizontal: 4,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 11,
  },
  statusOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  statusCard: {
    width: '90%',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  statusIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  statusBtn: {
    width: '100%',
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  statusBtnSmall: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  deleteBtn: {
    width: '100%',
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});

export default ProfileAccountSetting;