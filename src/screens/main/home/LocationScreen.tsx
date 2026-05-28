import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  Platform,
  InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { radius } from '../../../theme/radius';
import { RootState, AppDispatch } from '../../../redux/store';
import { setSelectedLocation } from '../../../redux/slice/addressSlice';
import { fetchMetaCities } from '../../../redux/slice/metaSlice';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const POPULAR_CITIES = [
  { id: '1', name: 'Mumbai', sub: 'Maharashtra' },
  { id: '2', name: 'Delhi', sub: 'NCR' },
  { id: '3', name: 'Bangalore', sub: 'Karnataka' },
  { id: '4', name: 'Hyderabad', sub: 'Telangana' },
  { id: '5', name: 'Pune', sub: 'Maharashtra' },
  { id: '6', name: 'Chennai', sub: 'Tamil Nadu' },
  { id: '7', name: 'Kolkata', sub: 'West Bengal' },
  { id: '8', name: 'Ahmedabad', sub: 'Gujarat' },
];

const AREAS_MOCK: Record<string, string[]> = {
  'Mumbai': ['Andheri East', 'Andheri West', 'Bandra', 'Borivali', 'Dadar', 'Goregaon', 'Malad', 'Powai', 'Thane', 'Vashi', 'Worli'],
  'Delhi': ['Connaught Place', 'Dwarka', 'Karol Bagh', 'Lajpat Nagar', 'Rohini', 'Saket', 'Vasant Kunj'],
  'Bangalore': ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'Electronic City', 'Jayanagar'],
  'Pune': ['Baner', 'Hinjewadi', 'Kothrud', 'Viman Nagar', 'Wakad'],
};

const LocationScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedCity, selectedArea } = useSelector((state: RootState) => state.address || {});
  const { cities } = useSelector((state: RootState) => state.meta);
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [activeStep, setActiveStep] = useState<'city' | 'area'>(selectedCity ? 'area' : 'city');
  const [tempCity, setTempCity] = useState(selectedCity || 'Mumbai');

  React.useEffect(() => {
    if (cities.length === 0) {
      dispatch(fetchMetaCities());
    }
  }, [dispatch, cities.length]);

  const uniqueCities = React.useMemo(() => {
    if (cities.length === 0) {
      return POPULAR_CITIES.map(c => c.name);
    }
    const set = new Set<string>();
    cities.forEach((c: any) => {
      if (c.city) {
        set.add(c.city);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [cities]);

  const filteredCities = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return uniqueCities;
    return uniqueCities.filter(c => c.toLowerCase().includes(q));
  }, [uniqueCities, search]);

  const currentAreas = React.useMemo(() => {
    if (cities.length === 0) {
      return AREAS_MOCK[tempCity] || AREAS_MOCK['Mumbai'] || [];
    }
    const areas = cities
      .filter((c: any) => c.city.toLowerCase() === tempCity.toLowerCase() && c.area)
      .map((c: any) => c.area);
    return Array.from(new Set(areas)).sort((a, b) => a.localeCompare(b));
  }, [cities, tempCity]);

  const filteredAreas = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = [t('locationScreen.entireCity', 'Entire City'), ...currentAreas];
    if (!q) return base;
    return base.filter(a => a.toLowerCase().includes(q));
  }, [currentAreas, search, t]);

  const handleCitySelect = (city: string) => {
    setTempCity(city);
    setActiveStep('area');
    setSearch(''); // Clear search query for area search
  };

  const handleAreaSelect = (area: string) => {
    const cityObj = cities.find((c: any) => c.city.toLowerCase() === tempCity.toLowerCase());
    const cityId = cityObj ? cityObj.city_id : undefined;

    navigation.goBack();
    InteractionManager.runAfterInteractions(() => {
      dispatch(setSelectedLocation({ city: tempCity, area: area }));
      navigation.navigate('AllJobs', {
        screen: 'AllJobsList',
        params: {
          filters: {
            city_id: cityId,
            location: area === 'Entire City' ? undefined : area,
          }
        }
      } as any);
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>{t('locationScreen.title', 'Choose Location')}</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceHighlight }]}>
          <Icon name="search" size={20} color={colors.textPlaceholder} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder={activeStep === 'city' ? t('locationScreen.searchCity', 'Search your city') : t('locationScreen.searchArea', 'Search your area')}
            placeholderTextColor={colors.textPlaceholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Use Current Location Button */}
       

          {/* New Selection Bar below Current Location */}
          <View style={[styles.selectionBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable
              onPress={() => setActiveStep('city')}
              style={[
                styles.selectionItem,
                activeStep === 'city' && { backgroundColor: colors.primary + '15', borderRadius: radius.md }
              ]}
            >
              <Text style={[styles.selectionLabel, { color: activeStep === 'city' ? colors.primary : colors.textSecondary }]}>
                {t('locationScreen.cityLabel', 'CITY')}
              </Text>
              <Text style={[styles.selectionValue, { color: colors.textPrimary }]} numberOfLines={1}>
                {tempCity}
              </Text>
            </Pressable>

            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            <Pressable
              onPress={() => setActiveStep('area')}
              style={[
                styles.selectionItem,
                activeStep === 'area' && { backgroundColor: colors.primary + '15', borderRadius: radius.md }
              ]}
            >
              <Text style={[styles.selectionLabel, { color: activeStep === 'area' ? colors.primary : colors.textSecondary }]}>
                {t('locationScreen.areaLabel', 'AREA')}
              </Text>
              <Text style={[styles.selectionValue, { color: colors.textPrimary }]} numberOfLines={1}>
                {activeStep === 'city' ? t('locationScreen.selectArea', 'Select Area') : (selectedArea || t('locationScreen.selectArea', 'Select Area'))}
              </Text>
            </Pressable>
          </View>

          {activeStep === 'city' ? (
            <View style={styles.section}>
              <Text style={[typography.labelMedium, { color: colors.textSecondary, marginBottom: 16 }]}>
                {search.trim().length === 0 ? t('locationScreen.allCities', 'ALL CITIES') : t('locationScreen.searchResults', 'SEARCH RESULTS')}
              </Text>
              <View style={styles.areasList}>
                {filteredCities.map((city, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleCitySelect(city)}
                    style={[styles.areaItem, { borderBottomColor: colors.border }]}
                  >
                    <Icon name="map-pin" size={16} color={colors.textPlaceholder} />
                    <Text style={[typography.body, { color: colors.textPrimary, marginLeft: 12 }]}>{city}</Text>
                    <Icon name="chevron-right" size={16} color={colors.textPlaceholder} style={{ marginLeft: 'auto' }} />
                  </Pressable>
                ))}
                {filteredCities.length === 0 && (
                  <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                    <Text style={[typography.body, { color: colors.textSecondary }]}>{t('locationScreen.noCitiesFound', 'No cities found')}</Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={[typography.labelMedium, { color: colors.textSecondary, marginBottom: 16 }]}>
                {t('locationScreen.areasIn', 'AREAS IN')} {tempCity.toUpperCase()}
              </Text>
              <View style={styles.areasList}>
                {filteredAreas.map((area, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleAreaSelect(area)}
                    style={[styles.areaItem, { borderBottomColor: colors.border }]}
                  >
                    <Icon name="map-pin" size={16} color={colors.textPlaceholder} />
                    <Text style={[typography.body, { color: colors.textPrimary, marginLeft: 12 }]}>{area}</Text>
                    <Icon name="chevron-right" size={16} color={colors.textPlaceholder} style={{ marginLeft: 'auto' }} />
                  </Pressable>
                ))}
                {filteredAreas.length === 0 && (
                  <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                    <Text style={[typography.body, { color: colors.textSecondary }]}>{t('locationScreen.noAreasFound', 'No areas found')}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  content: { flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    height: 50,
    borderRadius: radius.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  scroll: { paddingBottom: 40 },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    padding: 16,
    borderRadius: radius.xl,
    marginBottom: 16,
  },
  gpsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsText: { flex: 1, marginLeft: 16 },

  selectionBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    padding: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: 'center',
  },
  selectionItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  selectionValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  separator: {
    width: 1,
    height: '60%',
    marginHorizontal: 8,
  },

  section: { paddingHorizontal: spacing.md, marginBottom: 24 },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
    paddingTop: 4,
    overflow: 'visible',
  },
  cityChip: {
    width: Math.floor((width - spacing.md * 2 - 16) / 3) - 2,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 68,
    marginVertical: 4,
    overflow: 'visible',
  },
  areasList: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default LocationScreen;
