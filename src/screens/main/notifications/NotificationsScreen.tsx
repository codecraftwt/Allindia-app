import React, { useEffect, useMemo } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View, ActivityIndicator, RefreshControl } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import type { HomeStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { components } from '../../../theme/components';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography, moderateScale } from '../../../theme/typography';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, clearAllNotifications, ApiNotification } from '../../../redux/slice/notificationSlice';
import type { RootState, AppDispatch } from '../../../redux/store';
import { useTranslation } from 'react-i18next';
import GuestView from '../../../components/GuestView';

type Props = StackScreenProps<HomeStackParamList, 'Notifications'>;

function timeAgo(dateString: string, justNowLabel: string) {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return justNowLabel;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return past.toLocaleDateString();
}

const NotificationRow = React.memo(function NotificationRow({ item, colors, onPress, t }: { item: ApiNotification; colors: ThemeColors; onPress: () => void; t: (key: string, fallback: string) => string }) {
  const isJob = item.type?.includes('Job') || false;
  const iconBg = isJob ? colors.surfaceHighlight : colors.successBackground;
  const iconColor = isJob ? colors.primary : colors.success;
  const pillBg = isJob ? colors.badgeBackground : colors.successBackground;
  const pillFg = isJob ? colors.badgeText : colors.success;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: item.is_read ? colors.surface : colors.surfaceHighlight,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Icon name={isJob ? 'briefcase' : 'building-o'} size={moderateScale(18)} color={iconColor} />
      </View>
      <View style={styles.cardBody}>
        <Text style={[typography.labelMedium, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[typography.small, { color: colors.textSecondary, marginTop: moderateScale(4) }]} numberOfLines={3}>
          {item.message}
        </Text>
        <View style={styles.cardFooter}>
          <View style={[styles.typePill, { backgroundColor: pillBg }]}>
            <Text style={[typography.small, { color: pillFg, fontFamily: typography.labelMedium.fontFamily }]}>
              {isJob ? t('notificationsScreen.jobAlertPill', 'Job alert') : t('notificationsScreen.employerPill', 'Employer activity')}
            </Text>
          </View>
          <Text style={[typography.small, { color: colors.textPlaceholder }]}>{timeAgo(item.created_at, t('notificationsScreen.justNow', 'Just now'))}</Text>
        </View>
      </View>
    </Pressable>
  );
});

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const { notifications, loading } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchNotifications(50));
    }
  }, [dispatch, isLoggedIn]);

  const handleMarkAsRead = React.useCallback((item: ApiNotification) => {
    if (!item.is_read) {
      dispatch(markNotificationAsRead(item.id));
    }

    let notifData = item.data;
    if (typeof notifData === 'string') {
      try { notifData = JSON.parse(notifData); } catch(e) {}
    }

    const titleStr = (item.title || '').toLowerCase();
    const typeStr = (item.type || '').toLowerCase();

    const isJobNotification = typeStr.includes('job') || titleStr.includes('job') || typeStr.includes('application') || titleStr.includes('application');

    if (isJobNotification) {
      let jobId = notifData?.job_id || 
                  notifData?.jobId || 
                  notifData?.job?.id || 
                  notifData?.application?.job_id ||
                  notifData?.application?.job?.id ||
                  notifData?.meta?.job_id;
      
      if (!jobId && notifData?.id) {
        jobId = notifData.id;
      }

      if (jobId) {
        // @ts-ignore
        navigation.navigate('JobDetail', { jobId });
      }
    }
  }, [dispatch, navigation]);

  const handleMarkAllRead = React.useCallback(() => {
    if (notifications.some(n => !n.is_read)) {
      dispatch(markAllNotificationsAsRead());
    }
  }, [dispatch, notifications]);

  const handleDelete = React.useCallback((id: string) => {
    dispatch(deleteNotification(id));
  }, [dispatch]);

  const handleClearAll = React.useCallback(() => {
    if (notifications.length > 0) {
      dispatch(clearAllNotifications());
    }
  }, [dispatch, notifications]);

  const sections = useMemo(() => {
    const jobAlerts: ApiNotification[] = [];
    const employerActivity: ApiNotification[] = [];
    
    notifications.forEach(n => {
      if (n.type?.includes('Job')) {
        jobAlerts.push(n);
      } else {
        employerActivity.push(n);
      }
    });
    
    const s = [];
    if (jobAlerts.length > 0) s.push({ title: t('notificationsScreen.jobAlerts', 'Job alerts'), data: jobAlerts });
    if (employerActivity.length > 0) s.push({ title: t('notificationsScreen.employerActivity', 'Employer activity'), data: employerActivity });
    return s;
  }, [notifications, t]);

  const handleRefresh = React.useCallback(() => {
    dispatch(fetchNotifications(50));
  }, [dispatch]);

  const keyExtractor = React.useCallback((item: ApiNotification) => item.id, []);

  const renderSectionHeader = React.useCallback(({ section: { title } }: any) => (
    <Text style={[typography.sectionTitle, styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
  ), [colors.textPrimary]);

  const renderItem = React.useCallback(({ item }: { item: ApiNotification }) => (
    <Swipeable
      renderRightActions={() => (
        <View style={styles.deleteActionContainer}>
          <Pressable
            onPress={() => handleDelete(item.id)}
            style={[styles.deleteAction, { backgroundColor: colors.error }]}
          >
            <Icon name="trash" size={moderateScale(18)} color="#FFF" />
          </Pressable>
        </View>
      )}
      onSwipeableOpen={(direction, swipeable) => {
        if (direction === 'right') {
          handleDelete(item.id);
          swipeable.close();
        }
      }}
      rightThreshold={moderateScale(70)}
    >
      <NotificationRow item={item} colors={colors} onPress={() => handleMarkAsRead(item)} t={t} />
    </Swipeable>
  ), [colors, handleDelete, handleMarkAsRead, t]);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={moderateScale(10)} style={styles.backBtn} accessibilityLabel="Go back">
              <Icon name="chevron-left" size={moderateScale(20)} color={colors.textPrimary} />
            </Pressable>
          </View>
          <Text style={[typography.appTitle, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]}>
            {t('notificationsScreen.title', 'Notifications')}
          </Text>
          <View style={styles.headerRight} />
        </View>
        <GuestView
          icon="bell-o"
          title={t('notificationsScreen.guestTitle', 'Notifications')}
          subtitle={t('notificationsScreen.guestSubtitle', 'Log in or register to receive real-time updates on your job applications, interview alerts, and employer messages.')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={moderateScale(10)} style={styles.backBtn} accessibilityLabel="Go back">
            <Icon name="chevron-left" size={moderateScale(20)} color={colors.textPrimary} />
          </Pressable>
        </View>
        <Text style={[typography.appTitle, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]}>
          {t('notificationsScreen.title', 'Notifications')}
        </Text>
        <View style={styles.headerRight}>
          {notifications.length > 0 && (
            <>
              <Pressable onPress={handleMarkAllRead} hitSlop={moderateScale(10)} style={styles.actionBtn} accessibilityLabel="Mark all read">
                <Icon name="check-square-o" size={moderateScale(20)} color={colors.primary} />
              </Pressable>
              <Pressable onPress={handleClearAll} hitSlop={moderateScale(10)} style={styles.actionBtn} accessibilityLabel="Clear all">
                <Icon name="trash-o" size={moderateScale(20)} color={colors.error} />
              </Pressable>
            </>
          )}
        </View>
      </View>

      {loading && notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>{t('notificationsScreen.noNotifications', 'No notifications yet.')}</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          SectionSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: spacing.md },
          ]}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: moderateScale(6),
    borderBottomWidth: StyleSheet.hairlineWidth,
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  card: {
    ...components.jobCard,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  typePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: moderateScale(3),
    borderRadius: radius.sm,
  },
  deleteActionContainer: {
    width: moderateScale(70),
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deleteAction: {
    width: moderateScale(60),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.card,
  },
  headerLeft: {
    width: moderateScale(70),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerRight: {
    width: moderateScale(70),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  actionBtn: {
    width: moderateScale(34),
    height: moderateScale(38),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NotificationsScreen;
