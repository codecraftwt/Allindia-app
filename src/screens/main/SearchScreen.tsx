import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../context/ThemeContext';
import type { SearchStackParamList } from '../../navigation/types';
import type { ThemeColors } from '../../theme/colors';
import { components } from '../../theme/components';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { INITIAL_RECENT_SEARCHES, SUGGESTED_KEYWORDS } from './searchMockData';

type SearchNav = StackNavigationProp<SearchStackParamList, 'SearchHome'>;

function SectionHeader({ title, colors }: { title: string; colors: ThemeColors }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
    </View>
  );
}

const SearchScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SearchNav>();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>(INITIAL_RECENT_SEARCHES);

  const goToResults = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        return;
      }
      setRecent(prev => {
        const next = [trimmed, ...prev.filter(x => x.toLowerCase() !== trimmed.toLowerCase())];
        return next.slice(0, 8);
      });
      navigation.navigate('JobListing', { query: trimmed });
    },
    [navigation],
  );

  const removeRecent = useCallback((item: string) => {
    setRecent(prev => prev.filter(x => x !== item));
  }, []);

  const onChipPress = useCallback(
    (text: string) => {
      setQuery(text);
      goToResults(text);
    },
    [goToResults],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.xxl + Math.max(insets.bottom, spacing.md) },
        ]}>
        <View style={[styles.searchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Icon name="search" size={18} color={colors.textPlaceholder} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search jobs, companies, skills…"
            placeholderTextColor={colors.textPlaceholder}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => goToResults(query)}
            accessibilityLabel="Search jobs"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear search">
              <Icon name="times-circle" size={20} color={colors.textPlaceholder} />
            </Pressable>
          ) : null}
        </View>

        <Pressable
          style={[styles.searchCta, { backgroundColor: colors.primary }]}
          onPress={() => goToResults(query)}
          disabled={!query.trim()}>
          <Text
            style={[
              typography.labelMedium,
              { color: colors.onPrimary, opacity: query.trim() ? 1 : 0.5 },
            ]}>
            Search jobs
          </Text>
        </Pressable>

        <SectionHeader title="Recent searches" colors={colors} />
        {recent.length === 0 ? (
          <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
            Your recent searches will appear here.
          </Text>
        ) : (
          <View style={styles.recentList}>
            {recent.map(item => (
              <View
                key={item}
                style={[
                  styles.recentRow,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}>
                <Pressable
                  style={styles.recentMain}
                  onPress={() => {
                    setQuery(item);
                    goToResults(item);
                  }}>
                  <Icon name="clock-o" size={16} color={colors.textPlaceholder} />
                  <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                    {item}
                  </Text>
                </Pressable>
                <Pressable onPress={() => removeRecent(item)} hitSlop={10} accessibilityLabel={`Remove ${item}`}>
                  <Icon name="times" size={16} color={colors.textPlaceholder} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <SectionHeader title="Suggested keywords" colors={colors} />
        <View style={styles.chipsWrap}>
          {SUGGESTED_KEYWORDS.map(kw => (
            <Pressable
              key={kw}
              onPress={() => onChipPress(kw)}
              style={[
                styles.keywordChip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}>
              <Text style={[typography.small, { color: colors.primary, fontFamily: typography.labelMedium.fontFamily }]}>
                {kw}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...components.searchBar,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: typography.body.fontFamily,
    paddingVertical: 0,
    minHeight: 24,
  },
  searchCta: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: radius.button,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  recentList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  recentRow: {
    ...components.jobCard,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    shadowOpacity: 0.04,
    elevation: 1,
  },
  recentMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  keywordChip: {
    ...components.jobCard,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.04,
    elevation: 1,
  },
});

export default SearchScreen;
