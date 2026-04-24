import React from 'react';
import { Modal, StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  colors: any;
  loading?: boolean;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onClose, onConfirm, colors, loading }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.error + '15' }]}>
            <Icon name="sign-out" size={24} color={colors.error} />
          </View>
          
          <Text style={[typography.h4, { color: colors.textPrimary, marginTop: spacing.md }]}>
            Log Out?
          </Text>
          <Text style={[typography.labelMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
            Are you sure you want to log out from your account?
          </Text>

          <View style={styles.buttonContainer}>
            <Pressable 
              style={[styles.btn, styles.cancelBtn, { borderColor: colors.border }]} 
              onPress={onClose}>
              <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.btn, styles.logoutBtn, { backgroundColor: colors.error }]} 
              onPress={onConfirm}
              disabled={loading}>
              <Text style={[typography.labelMedium, { color: '#FFFFFF', fontWeight: '700' }]}>
                {loading ? 'Logging out...' : 'Log Out'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    elevation: 24,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  logoutBtn: {
    elevation: 2,
  },
});

export default LogoutModal;
