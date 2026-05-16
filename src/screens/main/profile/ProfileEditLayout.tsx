import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
  ListRenderItem,
  ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AuthHeadline, AuthScreenHeader } from '../../../components/auth';
import type { ProfileStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { spacing } from '../../../theme/spacing';

type Nav = StackNavigationProp<ProfileStackParamList>;

type Props = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  useFlatList?: boolean;
  flatListData?: any[];
  renderFlatItem?: ListRenderItem<any>;
  flatListExtraData?: any;
  scrollProps?: Partial<ScrollViewProps>;
};

export const ProfileEditLayout: React.FC<Props> = ({
  title,
  subtitle,
  children,
  useFlatList,
  flatListData,
  renderFlatItem,
  flatListExtraData,
  scrollProps
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const renderHeader = () => (
    <View style={styles.headerWrap}>
      <AuthScreenHeader 
        title="Profile" 
        onBack={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('ProfileOverview' as any);
          }
        }} 
        colors={colors} 
      />
      <AuthHeadline colors={colors} title={title} subtitle={subtitle} />
      {/* Inject additional header content if provided via scrollProps */}
      {scrollProps?.ListHeaderComponent && (
        <View>
          {React.isValidElement(scrollProps.ListHeaderComponent)
            ? scrollProps.ListHeaderComponent
            : typeof scrollProps.ListHeaderComponent === 'function'
              ? (scrollProps.ListHeaderComponent as any)()
              : null
          }
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, { backgroundColor: `${colors.primary}0D`, top: -28, right: -40 }]} />
        <View style={[styles.blob, { backgroundColor: `${colors.primary}0A`, bottom: 72, left: -32 }]} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 20}>

        {useFlatList && flatListData && renderFlatItem ? (
          <FlatList
            data={flatListData}
            renderItem={renderFlatItem}
            keyExtractor={(item, index) => item.id || String(index)}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            extraData={flatListExtraData}
            removeClippedSubviews={false}
            initialNumToRender={12}
            maxToRenderPerBatch={8}
            windowSize={5}
            decelerationRate="normal"
            scrollEventThrottle={16}
            overScrollMode="never"
            {...Object.fromEntries(Object.entries(scrollProps || {}).filter(([k]) => k !== 'ListHeaderComponent'))}
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={true}
            decelerationRate="normal"
            scrollEventThrottle={16}
            {...scrollProps}
          >
            {renderHeader()}
            <View style={styles.body}>{children}</View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* Portals or Modals passed as children while in FlatList mode */}
      {useFlatList && children}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  headerWrap: {
    marginBottom: spacing.xs,
  },
  blob: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: 120,
  },
  body: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
});
