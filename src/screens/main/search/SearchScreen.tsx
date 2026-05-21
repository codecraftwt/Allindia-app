import React, { useCallback, useState, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../../context/ThemeContext';
import type { SearchStackParamList } from '../../../navigation/types';
import type { ThemeColors } from '../../../theme/colors';
import { components } from '../../../theme/components';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { INITIAL_RECENT_SEARCHES, SUGGESTED_KEYWORDS } from './searchMockData';

type SearchNav = StackNavigationProp<SearchStackParamList, 'SearchHome'>;

const SKILL_SUGGESTIONS = ['React Native', 'React JS', 'Java Developer', 'Python Expert', 'Sales Executive', 'Marketing Manager', 'UI/UX Designer', 'Backend Engineer', 'Data Scientist', 'HR Generalist'];
const LOCATION_SUGGESTIONS = ['Mumbai, Maharashtra', 'Pune, Maharashtra', 'Bangalore, Karnataka', 'Delhi, NCR', 'Hyderabad, Telangana', 'Remote', 'Noida, UP', 'Chennai, Tamil Nadu', 'Gurgaon, Haryana', 'Ahmedabad, Gujarat'];

const SectionHeader: React.FC<{ title: string; colors: ThemeColors }> = ({ title, colors }) => (
  <View style={styles.sectionHeader}>
    <Text style={[typography.labelMedium, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }]}>
      {title}
    </Text>
  </View>
);

const SearchScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SearchNav>();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>(INITIAL_RECENT_SEARCHES);

  // Load recent searches from AsyncStorage on screen focus
  useFocusEffect(
    useCallback(() => {
      const loadRecentSearches = async () => {
        try {
          const stored = await AsyncStorage.getItem('recent_searches');
          if (stored) {
            setRecent(JSON.parse(stored));
          } else {
            // Initialize storage with initial recent searches
            await AsyncStorage.setItem('recent_searches', JSON.stringify(INITIAL_RECENT_SEARCHES));
            setRecent(INITIAL_RECENT_SEARCHES);
          }
        } catch (e) {
          console.warn('Failed to load recent searches:', e);
          setRecent(INITIAL_RECENT_SEARCHES);
        }
      };
      loadRecentSearches();
    }, [])
  );

  // Suggestion States
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [activeInput, setActiveInput] = useState<'skill' | 'location' | null>(null);

  const EXP_OPTIONS = ['Fresher', '1-2 Years', '3-5 Years', '5-10 Years', '10+ Years'];

  const goToResults = useCallback(
    async (q: string) => {
      Keyboard.dismiss();
      const trimmed = q.trim();
      if (!trimmed) {
        return;
      }
      const currentList = Array.isArray(recent) ? recent : [];
      const next = [trimmed, ...currentList.filter(x => x.toLowerCase() !== trimmed.toLowerCase())];
      const sliced = next.slice(0, 8);

      setRecent(sliced);
      try {
        await AsyncStorage.setItem('recent_searches', JSON.stringify(sliced));
      } catch (err) {
        console.warn('Failed to save search:', err);
      }
      navigation.navigate('SearchResults', { query: trimmed });
    },
    [navigation, recent],
  );

  const removeRecent = useCallback(
    async (item: string) => {
      const currentList = Array.isArray(recent) ? recent : [];
      const next = currentList.filter(x => x !== item);
      setRecent(next);
      try {
        await AsyncStorage.setItem('recent_searches', JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to remove recent search:', err);
      }
    },
    [recent],
  );

  const clearAllRecent = useCallback(async () => {
    setRecent([]);
    try {
      await AsyncStorage.setItem('recent_searches', JSON.stringify([]));
    } catch (err) {
      console.warn('Failed to clear recent searches:', err);
    }
  }, []);

  const handleSkillChange = (text: string) => {
    setQuery(text);
    if (text.trim().length > 0) {
      const filtered = SKILL_SUGGESTIONS.filter(s => s.toLowerCase().includes(text.toLowerCase()));
      setFilteredSkills(filtered);
      setActiveInput('skill');
    } else {
      setFilteredSkills([]);
      setActiveInput(null);
    }
  };

  const handleLocationChange = (text: string) => {
    setLocation(text);
    if (text.trim().length > 0) {
      const filtered = LOCATION_SUGGESTIONS.filter(l => l.toLowerCase().includes(text.toLowerCase()));
      setFilteredLocations(filtered);
      setActiveInput('location');
    } else {
      setFilteredLocations([]);
      setActiveInput(null);
    }
  };

  const selectSkill = (skill: string) => {
    setQuery(skill);
    setFilteredSkills([]);
    setActiveInput(null);
    goToResults(skill);
  };

  const selectLocation = (loc: string) => {
    setLocation(loc);
    setFilteredLocations([]);
    setActiveInput(null);
    goToResults(loc);
  };

  const onChipPress = useCallback(
    (text: string) => {
      setQuery(text);
      goToResults(text);
    },
    [goToResults],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 20 },
        ]}>

        {/* Naukri Style Search Container */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Role Input */}
          <View style={[styles.inputRow, { borderBottomColor: colors.border }]}>
            <Icon name="briefcase" size={18} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Skills, Designations, Companies"
              placeholderTextColor={colors.textPlaceholder}
              value={query}
              onChangeText={handleSkillChange}
              onFocus={() => query.length > 0 && setActiveInput('skill')}
              onSubmitEditing={() => {
                const finalQuery = query.trim() || location.trim();
                goToResults(finalQuery);
              }}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => { setQuery(''); setFilteredSkills([]); setActiveInput(null); }}>
                <Icon name="times-circle" size={18} color={colors.textPlaceholder} />
              </Pressable>
            )}
          </View>

          {/* Location Input */}
          <View style={styles.inputRow}>
            <Icon name="map-marker" size={18} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Enter location"
              placeholderTextColor={colors.textPlaceholder}
              value={location}
              onChangeText={handleLocationChange}
              onFocus={() => location.length > 0 && setActiveInput('location')}
              onSubmitEditing={() => {
                const finalQuery = query.trim() || location.trim();
                goToResults(finalQuery);
              }}
              returnKeyType="search"
            />
            {location.length > 0 && (
              <Pressable onPress={() => { setLocation(''); setFilteredLocations([]); setActiveInput(null); }}>
                <Icon name="times-circle" size={18} color={colors.textPlaceholder} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Suggestion Dropdown */}
        {(activeInput === 'skill' && filteredSkills.length > 0) && (
          <View style={[styles.suggestionDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {filteredSkills.map((item, index) => (
              <Pressable key={index} style={styles.suggestionItem} onPress={() => selectSkill(item)}>
                <Icon name="search" size={14} color={colors.textPlaceholder} style={{ marginRight: 10 }} />
                <Text style={{ color: colors.textPrimary }}>{item}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {(activeInput === 'location' && filteredLocations.length > 0) && (
          <View style={[styles.suggestionDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {filteredLocations.map((item, index) => (
              <Pressable key={index} style={styles.suggestionItem} onPress={() => selectLocation(item)}>
                <Icon name="map-marker" size={14} color={colors.textPlaceholder} style={{ marginRight: 10 }} />
                <Text style={{ color: colors.textPrimary }}>{item}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Experience Selection */}
        <SectionHeader title="Work experience" colors={colors} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.expScroll}>
          {EXP_OPTIONS.map(exp => (
            <Pressable
              key={exp}
              onPress={() => setExperience(exp === experience ? null : exp)}
              style={[
                styles.expChip,
                {
                  backgroundColor: experience === exp ? colors.primary : colors.surfaceHighlight,
                  borderColor: experience === exp ? colors.primary : colors.border
                }
              ]}
            >
              <Text style={[styles.expText, { color: experience === exp ? '#fff' : colors.textPrimary }]}>{exp}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          style={[styles.searchCta, { backgroundColor: colors.primary }]}
          onPress={() => {
            const finalQuery = query.trim() || location.trim();
            goToResults(finalQuery);
          }}
          disabled={!query.trim() && !location.trim()}>
          <Text
            style={[
              styles.searchCtaText,
              { color: colors.onPrimary, opacity: (query.trim() || location.trim()) ? 1 : 0.6 },
            ]}>
            Search jobs
          </Text>
        </Pressable>

        {/* Recent Searches Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.md }}>
          <Text style={[typography.labelMedium, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }]}>
            Recent searches
          </Text>
          {recent.length > 0 && (
            <Pressable onPress={clearAllRecent} style={{ paddingVertical: 4, paddingHorizontal: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>Clear All</Text>
            </Pressable>
          )}
        </View>

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

                <Pressable onPress={() => removeRecent(item)} style={{ padding: 6, marginLeft: 8 }}>
                  <Icon name="times" size={14} color={colors.textPlaceholder} />
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
    paddingTop: 32, // Moved search bar lower
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  searchContainer: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18, // Increased height
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inputIcon: {
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 18, // Increased font size
    fontWeight: '600',
    paddingVertical: 0,
  },
  expScroll: {
    paddingBottom: spacing.lg,
    gap: 10,
  },
  expChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  expText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  searchCta: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  searchCtaText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  suggestionDropdown: {
    marginTop: -spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 4,
    elevation: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.xs,
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
