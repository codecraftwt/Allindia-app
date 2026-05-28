import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { typography } from '../theme/typography';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { ThemeColors } from '../theme/colors';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { reportJob } from '../redux/slice/jobSlice';

interface JobActionModalProps {
  visible: boolean;
  onClose: () => void;
  job: any;
  colors: ThemeColors;
  onShare: (job: any) => void;
  type?: 'modal' | 'dropdown';
  anchorPosition?: { top: number; right: number };
}

const REPORT_REASONS = [
  'Fake Job / Scam',
  'Asking for Money',
  'Inappropriate Content',
  'Already Filled / Closed',
  'Wrong Category / Details',
];

const JobActionModal: React.FC<JobActionModalProps> = ({
  visible,
  onClose,
  job,
  colors,
  onShare,
  type = 'modal',
  anchorPosition,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [view, setView] = useState<'menu' | 'report'>('menu');
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlreadyReported, setIsAlreadyReported] = useState(false);

  useEffect(() => {
    const checkReportedStatus = async () => {
      if (!job) return;
      if (job.is_reported) {
        setIsAlreadyReported(true);
        return;
      }
      try {
        const stored = await AsyncStorage.getItem('reported_jobs');
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list) && list.includes(job.id)) {
            setIsAlreadyReported(true);
            return;
          }
        }
      } catch (e) {
        console.warn(e);
      }
      setIsAlreadyReported(false);
    };

    if (visible) {
      checkReportedStatus();
    }
  }, [job, visible]);

  const handleReport = () => {
    setView('report');
  };

  const submitReport = async () => {
    if (!reportReason.trim()) return;
    setIsSubmitting(true);
    try {
      await dispatch(reportJob({ jobId: job.id, reason: reportReason })).unwrap();
      
      try {
        const stored = await AsyncStorage.getItem('reported_jobs');
        const list = stored ? JSON.parse(stored) : [];
        if (Array.isArray(list) && !list.includes(job.id)) {
          list.push(job.id);
          await AsyncStorage.setItem('reported_jobs', JSON.stringify(list));
        }
      } catch (e) {
        console.warn(e);
      }

      setIsAlreadyReported(true);

      // On success
      if (Platform.OS === 'android') {
        ToastAndroid.show('Job has been reported successfully.', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', 'Job has been reported successfully.');
      }
      setView('menu');
      setReportReason('');
      onClose();
    } catch (err: any) {
      // You can add a toast or alert here for errors
      console.log('Failed to report job:', err);
      Alert.alert('Error', err || 'Failed to report job');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) return null;

  const isDropdown = type === 'dropdown' && view === 'menu';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        style={[
          styles.overlay, 
          isDropdown && { backgroundColor: 'transparent' }
        ]} 
        onPress={onClose}
      >
        <Pressable 
          style={[
            isDropdown ? styles.dropdownContent : styles.content,
            { backgroundColor: colors.surface, borderColor: colors.border },
            isDropdown && anchorPosition && { top: anchorPosition.top, right: anchorPosition.right }
          ]} 
          onPress={e => e.stopPropagation()}
        >
          {view === 'menu' ? (
            <View>
              {type === 'modal' && (
                <Text style={[typography.labelMedium, { color: colors.textSecondary, marginBottom: 16, textAlign: 'center' }]}>
                  Choose Action
                </Text>
              )}
              
              <TouchableOpacity 
                style={[styles.menuItem, { borderBottomColor: colors.border }]} 
                onPress={() => {
                  onShare(job);
                  onClose();
                }}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                  <Icon name="share-alt" size={18} color={colors.primary} />
                </View>
                <Text style={[typography.body, { color: colors.textPrimary }]}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.menuItem, isAlreadyReported && { opacity: 0.6 }]} 
                disabled={isAlreadyReported}
                onPress={handleReport}
              >
                <View style={[styles.iconCircle, { backgroundColor: isAlreadyReported ? colors.border : '#fee2e2' }]}>
                  <Icon name="flag" size={16} color={isAlreadyReported ? colors.textPlaceholder : '#ef4444'} />
                </View>
                <Text style={[typography.body, { color: isAlreadyReported ? colors.textPlaceholder : colors.textPrimary }]}>
                  {isAlreadyReported ? 'Reported' : 'Report'}
                </Text>
              </TouchableOpacity>

              {type === 'modal' && (
                <TouchableOpacity 
                  style={[styles.cancelBtn, { marginTop: 12 }]} 
                  onPress={onClose}
                >
                  <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setView('menu')} hitSlop={12}>
                  <Icon name="arrow-left" size={18} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[typography.labelMedium, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]}>
                  Report Job
                </Text>
                <View style={{ width: 18 }} />
              </View>

              <Text style={[typography.small, { color: colors.textSecondary, marginBottom: 12 }]}>
                Tell us why you're reporting this job:
              </Text>

              <TextInput
                style={[styles.input, { 
                  color: colors.textPrimary, 
                  backgroundColor: colors.surfaceHighlight,
                  borderColor: colors.border
                }]}
                placeholder="Type your reason here..."
                placeholderTextColor={colors.textPlaceholder}
                multiline
                numberOfLines={3}
                value={reportReason}
                onChangeText={setReportReason}
              />

              <Text style={[typography.tiny, { color: colors.textPlaceholder, marginVertical: 12, fontWeight: 'bold' }]}>
                COMMON REASONS
              </Text>

              <View style={styles.reasonsGrid}>
                {REPORT_REASONS.map((r, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={[styles.reasonChip, { 
                      backgroundColor: reportReason === r ? colors.primary + '15' : colors.surfaceHighlight,
                      borderColor: reportReason === r ? colors.primary : 'transparent'
                    }]}
                    onPress={() => setReportReason(r)}
                  >
                    <Text style={[typography.tiny, { color: reportReason === r ? colors.primary : colors.textPrimary }]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={[
                  styles.submitBtn, 
                  { backgroundColor: reportReason.trim() ? colors.primary : colors.textPlaceholder }
                ]}
                disabled={!reportReason.trim() || isSubmitting}
                onPress={submitReport}
              >
                <Text style={[typography.labelMedium, { color: '#fff', fontWeight: 'bold' }]}>
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    borderRadius: radius.lg,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  dropdownContent: {
    position: 'absolute',
    width: 130,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  input: {
    height: 100,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  reasonChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  submitBtn: {
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default JobActionModal;
