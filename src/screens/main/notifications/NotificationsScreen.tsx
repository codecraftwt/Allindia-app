import React, { useEffect, useMemo } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View, ActivityIndicator, RefreshControl } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import type { HomeStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { components } from '../../../theme/components';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, ApiNotification } from '../../../redux/slice/notificationSlice';
import type { RootState, AppDispatch } from '../../../redux/store';

type Props = StackScreenProps<HomeStackParamList, 'Notifications'>;

function timeAgo(dateString: string) {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return past.toLocaleDateString();
}

function NotificationRow({ item, colors, onPress }: { item: ApiNotification; colors: ThemeColors; onPress: () => void }) {
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
        <Icon name={isJob ? 'briefcase' : 'building-o'} size={18} color={iconColor} />
      </View>
      <View style={styles.cardBody}>
        <Text style={[typography.labelMedium, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[typography.small, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={3}>
          {item.message}
        </Text>
        <View style={styles.cardFooter}>
          <View style={[styles.typePill, { backgroundColor: pillBg }]}>
            <Text style={[typography.small, { color: pillFg, fontFamily: typography.labelMedium.fontFamily }]}>
              {isJob ? 'Job alert' : 'Employer activity'}
            </Text>
          </View>
          <Text style={[typography.small, { color: colors.textPlaceholder }]}>{timeAgo(item.created_at)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  
  const { notifications, loading } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications(50));
  }, [dispatch]);

  const handleMarkAsRead = (item: ApiNotification) => {
    if (!item.is_read) {
      dispatch(markNotificationAsRead(item.id));
    }
  };

  const handleMarkAllRead = () => {
    if (notifications.some(n => !n.is_read)) {
      dispatch(markAllNotificationsAsRead());
    }
  };

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
    if (jobAlerts.length > 0) s.push({ title: 'Job alerts', data: jobAlerts });
    if (employerActivity.length > 0) s.push({ title: 'Employer activity', data: employerActivity });
    return s;
  }, [notifications]);

  const handleRefresh = () => {
    dispatch(fetchNotifications(50));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn} accessibilityLabel="Go back">
          <Icon name="chevron-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.appTitle, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]}>
          Notifications
        </Text>
        <Pressable onPress={handleMarkAllRead} hitSlop={12} style={styles.backBtn} accessibilityLabel="Mark all read">
          <Icon name="check-square-o" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {loading && notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>No notifications yet.</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[typography.sectionTitle, styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
          )}
          renderItem={({ item }) => <NotificationRow item={item} colors={colors} onPress={() => handleMarkAsRead(item)} />}
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
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
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
    width: 44,
    height: 44,
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
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
});

export default NotificationsScreen;
