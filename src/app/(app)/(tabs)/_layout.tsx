import { type Href } from 'expo-router';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { GlassSurface } from '@/components/ui/glass-surface';
import { Icon, type IconName } from '@/components/ui/icon';
import { Fonts, FloatingTabBar, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabDef = {
  name: string;
  href: Href;
  label: string;
  icon: IconName;
  activeIcon: IconName;
};

const TABS: TabDef[] = [
  { name: 'agenda', href: '/agenda' as Href, label: 'Agenda', icon: 'calendar-outline', activeIcon: 'calendar' },
  { name: 'profile', href: '/profile' as Href, label: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
  {
    name: 'patient-view',
    href: '/patient-view' as Href,
    label: 'Vista paciente',
    icon: 'eye-outline',
    activeIcon: 'eye',
  },
  {
    name: 'optisave-app',
    href: '/optisave-app' as Href,
    label: 'OptiSave',
    icon: 'rocket-outline',
    activeIcon: 'rocket',
  },
];

type TabButtonProps = TabTriggerSlotProps & {
  label: string;
  icon: IconName;
  activeIcon: IconName;
};

const TabButton = forwardRef<View, TabButtonProps>(
  ({ isFocused, label, icon, activeIcon, ...props }, ref) => {
    const { colors } = useTheme();
    const color = isFocused ? colors.primary : colors.textMuted;
    return (
      <Pressable
        ref={ref}
        {...props}
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityState={{ selected: !!isFocused }}>
        <View style={[styles.iconPill, isFocused && { backgroundColor: colors.primarySoft }]}>
          <Icon name={isFocused ? activeIcon : icon} size={22} tint={color} />
        </View>
        <ThemedText style={[styles.label, { color }]} numberOfLines={1}>
          {label}
        </ThemedText>
      </Pressable>
    );
  },
);
TabButton.displayName = 'TabButton';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, FloatingTabBar.bottomOffset);

  return (
    <Tabs>
      <TabSlot />

      <View
        pointerEvents="box-none"
        style={[styles.floating, { bottom, left: FloatingTabBar.horizontalMargin, right: FloatingTabBar.horizontalMargin }]}>
        <GlassSurface radius={Radius.pill} tone="strong" elevated="lg" intensity={70} padding={Spacing.xs}>
          <View style={styles.row}>
            {TABS.map((t) => (
              <TabTrigger key={t.name} name={t.name} asChild>
                <TabButton label={t.label} icon={t.icon} activeIcon={t.activeIcon} />
              </TabTrigger>
            ))}
          </View>
        </GlassSurface>
      </View>

      <TabList style={styles.hidden}>
        {TABS.map((t) => (
          <TabTrigger key={t.name} name={t.name} href={t.href} />
        ))}
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floating: {
    position: 'absolute',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: FloatingTabBar.height - Spacing.xs * 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 10,
  },
  hidden: {
    display: 'none',
  },
});
