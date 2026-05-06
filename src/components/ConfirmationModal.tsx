import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { radius } from '../theme/radius';
import type { ThemeColors } from '../theme/colors';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  colors: ThemeColors;
  loading?: boolean;
  type?: 'danger' | 'primary' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  colors,
  loading = false,
  type = 'danger',
}) => {
  const accentColor = type === 'danger' ? colors.error : (type === 'success' ? colors.success : colors.primary);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconBox, { backgroundColor: accentColor + '15' }]}>
            <Icon 
              name={type === 'danger' ? 'trash-2' : (type === 'success' ? 'check-circle' : 'help-circle')} 
              size={28} 
              color={accentColor} 
            />
          </View>
          
          <Text style={[typography.h4, { color: colors.textPrimary, marginTop: spacing.md, textAlign: 'center' }]}>
            {title}
          </Text>
          
          <Text style={[typography.labelMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 }]}>
            {message}
          </Text>

          <View style={styles.actionBox}>
            <Pressable 
              style={[styles.btn, { backgroundColor: accentColor }]} 
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={[typography.labelMedium, { color: '#FFFFFF', fontWeight: '700' }]}>{confirmText}</Text>
              )}
            </Pressable>
            
            <Pressable 
              onPress={onClose}
              disabled={loading}
              style={styles.cancelBtn}
            >
              <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>{cancelText}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  content: {
    width: '100%',
    maxWidth: 340,
    padding: 24,
    borderRadius: 32,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBox: {
    width: '100%',
    marginTop: 32,
    gap: 12,
  },
  btn: {
    width: '100%',
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ConfirmationModal;
