import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../../context/ThemeContext';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { useNavigation } from '@react-navigation/native';

const SAVED_DATA = [
  {
    id: 's1',
    company: 'Google',
    title: 'Senior UI/UX Designer',
    location: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=500',
    date: 'Saved on 20 April',
  },
  {
    id: 's2',
    company: 'Amazon',
    title: 'Cloud Architect',
    location: 'Remote',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=500',
    date: 'Saved on 18 April',
  },
  {
    id: 's3',
    company: 'Netflix',
    title: 'Content Strategist',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=500',
    date: 'Saved on 15 April',
  },
];

const SavedPostScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const navigation = useNavigation();

  const renderItem = ({ item }: any) => (
    <Pressable style={[styles.card, { backgroundColor: colors.surfaceHighlight }]}>
      <Image source={{ uri: item.image }} style={styles.thumbnail} />
      <View style={styles.info}>
        <Text style={[styles.jobTitle, { color: colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.company, { color: colors.primary }]}>{item.company}</Text>
        <View style={styles.meta}>
          <Icon name="map-marker" size={12} color={colors.textSecondary} />
          <Text style={[styles.location, { color: colors.textSecondary }]}>{item.location}</Text>
        </View>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{item.date}</Text>
      </View>
      <Pressable style={styles.removeBtn}>
        <Icon name="bookmark" size={20} color={colors.primary} />
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Saved Reels</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={SAVED_DATA}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="bookmark-o" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No saved reels yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  list: {
    padding: spacing.lg,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    overflow: 'hidden',
    padding: spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  thumbnail: {
    width: 80,
    height: 100,
    borderRadius: radius.md,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
  },
  date: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  removeBtn: {
    padding: 10,
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  }
});

export default SavedPostScreen;
