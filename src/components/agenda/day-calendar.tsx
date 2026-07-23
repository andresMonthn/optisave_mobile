import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Cita, ScheduleSlot } from '@/types';
import {
  HOUR_HEIGHT,
  citaDurationMinutes,
  dayBounds,
  isoToMinutes,
  isMinuteInSlots,
  minutesToLabel,
  parseTimeToMinutes,
  slotsForWeekday,
} from '@/utils/agenda';

type Props = {
  date: Date;
  schedule: ScheduleSlot[];
  citas: Cita[];
  onPressCita: (cita: Cita) => void;
};

export function DayCalendar({ date, schedule, citas, onPressCita }: Props) {
  const { colors } = useTheme();
  const weekday = date.getDay();
  const slots = slotsForWeekday(schedule, weekday);
  const { start, end } = dayBounds(schedule, weekday, citas, date);
  const totalMinutes = end - start;
  const gridHeight = (totalMinutes / 60) * HOUR_HEIGHT;

  const hourLabels: number[] = [];
  for (let m = start; m < end; m += 60) hourLabels.push(m);

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator nestedScrollEnabled>
      <View style={[styles.grid, { height: gridHeight }]}>
        {/* Hour lines + labels */}
        {hourLabels.map((minute) => {
          const top = ((minute - start) / 60) * HOUR_HEIGHT;
          return (
            <View key={minute} style={[styles.hourRow, { top }]}>
              <ThemedText variant="caption" color="textMuted" style={styles.hourLabel}>
                {minutesToLabel(minute)}
              </ThemedText>
              <View style={[styles.hourLine, { backgroundColor: colors.divider }]} />
            </View>
          );
        })}

        {/* Available windows (respects split schedule gaps) */}
        <View style={[styles.column, { left: 56 }]}>
          {Array.from({ length: Math.ceil(totalMinutes / 15) }, (_, i) => {
            const minute = start + i * 15;
            const top = ((minute - start) / 60) * HOUR_HEIGHT;
            const h = (15 / 60) * HOUR_HEIGHT;
            const open = slots.length > 0 && isMinuteInSlots(minute, slots);
            return (
              <View
                key={minute}
                style={[
                  styles.slotSlice,
                  {
                    top,
                    height: h,
                    backgroundColor: open ? colors.primarySoft : colors.backgroundAlt,
                    opacity: open ? 0.55 : 0.35,
                  },
                ]}
              />
            );
          })}

          {/* Appointment blocks */}
          {citas.map((cita) => {
            const startMin = isoToMinutes(cita.startsAt);
            const duration = citaDurationMinutes(cita);
            const top = ((startMin - start) / 60) * HOUR_HEIGHT;
            const height = Math.max((duration / 60) * HOUR_HEIGHT - 2, 28);
            const tone =
              cita.status === 'confirmada'
                ? colors.primary
                : cita.status === 'pendiente'
                  ? colors.warning
                  : colors.textMuted;

            return (
              <Pressable
                key={cita.id}
                onPress={() => onPressCita(cita)}
                style={[
                  styles.citaBlock,
                  {
                    top,
                    height,
                    backgroundColor: tone,
                  },
                ]}>
                <ThemedText variant="caption" style={styles.citaTitle} numberOfLines={1}>
                  {cita.patientName}
                </ThemedText>
                <ThemedText variant="caption" style={styles.citaSub} numberOfLines={1}>
                  {cita.serviceName}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  grid: {
    position: 'relative',
    marginTop: Spacing.sm,
  },
  hourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    height: HOUR_HEIGHT,
  },
  hourLabel: {
    width: 48,
    textAlign: 'right',
    paddingRight: Spacing.sm,
    fontFamily: Fonts.medium,
  },
  hourLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  column: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
  },
  slotSlice: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 2,
  },
  citaBlock: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    justifyContent: 'center',
    gap: 1,
  },
  citaTitle: {
    color: '#fff',
    fontFamily: Fonts.bold,
  },
  citaSub: {
    color: 'rgba(255,255,255,0.9)',
  },
});
