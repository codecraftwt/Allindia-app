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
import { SafeAreaView } from 'react-native-safe-area-context';
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
  scrollProps?: Partial<ScrollViewProps>;
};

export const ProfileEditLayout: React.FC<Props> = ({
  title,
  subtitle,
  children,
  useFlatList,
  flatListData,
  renderFlatItem,
  scrollProps
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();

  const renderHeader = () => (
    <View>
      <AuthScreenHeader title="Profile" onBack={() => navigation.goBack()} colors={colors} />
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, { backgroundColor: `${colors.primary}0D`, top: -28, right: -40 }]} />
        <View style={[styles.blob, { backgroundColor: `${colors.primary}0A`, bottom: 72, left: -32 }]} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>

        {useFlatList && flatListData && renderFlatItem ? (
          <FlatList
            data={flatListData}
            renderItem={renderFlatItem}
            keyExtractor={(item, index) => item.id || String(index)}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={Platform.OS === 'android'}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  blob: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  body: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
});
