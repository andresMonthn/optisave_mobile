import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { DayCalendar } from '@/components/agenda/day-calendar';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/header';
import { Fonts, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';
import { useAsyncData } from '@/hooks/use-async';
import { CitaService, NotificationService } from '@/services';
import { addDays, startOfDayDate } from '@/utils/agenda';
import { formatDayLabel, WEEKDAYS_LONG } from '@/utils/format';

export default function AgendaScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { doctor, userId } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => startOfDayDate(new Date()));

  const dateKey = selectedDate.toISOString();
  const { data: citas, loading } = useAsyncData(
    () => CitaService.listForDay(userId ?? undefined, selectedDate),
    [userId, dateKey],
  );
  const { data: notifications, reload: reloadNotifs } = useAsyncData(
    () => NotificationService.list(userId ?? undefined),
    [userId, dateKey],
  );

  const unread = (notifications ?? []).filter((n) => !n.read).length;
  const dayLabel = useMemo(() => formatDayLabel(selectedDate.toISOString()), [selectedDate]);

  const shiftDay = useCallback((delta: number) => {
    setSelectedDate((d) => addDays(d, delta));
  }, []);

  const goToday = useCallback(() => setSelectedDate(startOfDayDate(new Date())), []);

  if (!doctor) {
    return (
      <Screen scroll={false}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} tabBarInset header={<ScreenHeader title="Agenda" subtitle={WEEKDAYS_LONG[selectedDate.getDay()]} />}>
      {(notifications ?? []).length > 0 ? (
        <Card padding={Spacing.md} tone="strong" contentStyle={styles.notifCard}>
          <View style={styles.notifHeader}>
            <Icon name="notifications-outline" size={18} color="primary" />
            <ThemedText variant="callout">Notificaciones</ThemedText>
            {unread > 0 ? <Chip label={`${unread} nuevas`} tone="warning" /> : null}
          </View>
          {(notifications ?? []).slice(0, 3).map((n) => (
            <Pressable
              key={n.id}
              onPress={async () => {
                await NotificationService.markRead(n.id);
                reloadNotifs();
                if (n.citaId) router.push({ pathname: '/cita/[id]', params: { id: n.citaId } } as Href);
              }}
              style={({ pressed }) => [styles.notifRow, pressed && styles.pressed, !n.read && { opacity: 1 }]}>
              <ThemedText variant="small" style={!n.read ? styles.unread : undefined}>
                {n.body}
              </ThemedText>
            </Pressable>
          ))}
        </Card>
      ) : null}

      <View style={styles.dayNav}>
        <Pressable onPress={() => shiftDay(-1)} hitSlop={12} style={styles.navBtn}>
          <Icon name="chevron-back" size={22} color="primary" />
        </Pressable>
        <Pressable onPress={goToday} style={styles.dayCenter}>
          <ThemedText variant="callout">{dayLabel}</ThemedText>
          <ThemedText variant="caption" color="textMuted">
            {selectedDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
          </ThemedText>
        </Pressable>
        <Pressable onPress={() => shiftDay(1)} hitSlop={12} style={styles.navBtn}>
          <Icon name="chevron-forward" size={22} color="primary" />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <DayCalendar
          date={selectedDate}
          schedule={doctor.schedule}
          citas={citas ?? []}
          onPressCita={(c) => router.push({ pathname: '/cita/[id]', params: { id: c.id } } as Href)}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCard: {
    gap: Spacing.sm,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notifRow: {
    paddingVertical: 4,
    opacity: 0.85,
  },
  unread: {
    fontFamily: Fonts.bold,
  },
  pressed: {
    opacity: 0.6,
  },
  dayNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  navBtn: {
    padding: Spacing.sm,
  },
  dayCenter: {
    alignItems: 'center',
    gap: 2,
  },
  loader: {
    marginTop: Spacing.xl,
  },
});
