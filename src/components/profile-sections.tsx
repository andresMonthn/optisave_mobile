import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Rating } from '@/components/ui/rating';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Clinic, Doctor, ScheduleSlot, Service } from '@/types';
import { WEEKDAYS_LONG, cedulaVerificationMeta, formatMoney } from '@/utils/format';

export function HeroCard({ doctor }: { doctor: Doctor }) {
  const { colors } = useTheme();
  const primaryService = doctor.services.find((s) => s.isActive);
  const price = primaryService?.price ?? 0;
  const currency = primaryService?.currency ?? 'MXN';
  const cedulaMeta = cedulaVerificationMeta(doctor.isVerified);

  return (
    <Card padding={0} tone="strong">
      <View style={styles.cover}>
        <Image source={require('@/assets/images/baner.png')} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={StyleSheet.absoluteFill} />
      </View>

      <View style={styles.heroBody}>
        <View style={styles.avatarWrap}>
          {doctor.avatarUrl ? (
            <Image source={{ uri: doctor.avatarUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: colors.primarySoft }]}>
              <Icon name="person" size={36} tint={colors.primary} />
            </View>
          )}
        </View>
        <ThemedText variant="h2">{doctor.fullName}</ThemedText>
        <ThemedText variant="callout" color="primary">
          {doctor.specialty}
        </ThemedText>

        <View style={styles.heroChips}>
          <Chip label={cedulaMeta.label} icon={cedulaMeta.icon} tone={cedulaMeta.tone} />
          <Chip
            label={doctor.isActive ? 'Perfil publicado' : 'Perfil oculto'}
            icon={doctor.isActive ? 'eye' : 'eye-off-outline'}
            tone={doctor.isActive ? 'success' : 'warning'}
          />
          {doctor.hasCrmLicense ? (
            <Chip label="OptiSave CRM" icon="rocket" tone="accent" />
          ) : null}
        </View>

        <View style={styles.heroFooter}>
          <Rating value={doctor.ratingAvg} count={doctor.ratingCount} />
          {primaryService ? (
            <View style={styles.price}>
              <ThemedText style={[styles.priceValue, { color: colors.text }]}>
                {formatMoney(price, currency)}
              </ThemedText>
              <ThemedText variant="caption" color="textMuted">
                {primaryService.name}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

export function ServicesList({ services }: { services: Service[] }) {
  const { colors } = useTheme();
  if (!services.length) return null;

  return (
    <Card padding={Spacing.lg} contentStyle={styles.services}>
      {services.map((s) => (
        <View key={s.id} style={styles.serviceRow}>
          <View style={styles.flex}>
            <ThemedText variant="body">{s.name}</ThemedText>
            {s.description ? (
              <ThemedText variant="small" color="textSecondary">
                {s.description}
              </ThemedText>
            ) : null}
            {s.durationMinutes ? (
              <ThemedText variant="caption" color="textMuted">
                {s.durationMinutes} min
              </ThemedText>
            ) : null}
          </View>
          <ThemedText style={[styles.servicePrice, { color: colors.primary }]}>
            {formatMoney(s.price, s.currency)}
          </ThemedText>
        </View>
      ))}
    </Card>
  );
}

export function ClinicCard({ clinic }: { clinic: Clinic }) {
  const mapsQuery = encodeURIComponent(`${clinic.addressLine}, ${clinic.city}, ${clinic.state}`);

  return (
    <Card padding={Spacing.lg}>
      <View style={styles.clinicHeader}>
        <ThemedText variant="callout" style={styles.flex}>
          {clinic.name}
        </ThemedText>
        {clinic.isPrimary ? <Chip label="Principal" tone="primary" /> : null}
      </View>
      {clinic.addressLine ? (
        <ThemedText variant="small" color="textSecondary">
          {clinic.addressLine}
        </ThemedText>
      ) : null}
      {(clinic.city || clinic.state) && (
        <ThemedText variant="small" color="textMuted">
          {[clinic.city, clinic.state].filter(Boolean).join(', ')}
        </ThemedText>
      )}
      <View style={styles.clinicActions}>
        <ThemedText
          variant="small"
          color="primary"
          onPress={() => Linking.openURL(`https://maps.google.com/?q=${mapsQuery}`)}>
          Cómo llegar →
        </ThemedText>
        {clinic.phone ? (
          <ThemedText variant="small" color="primary" onPress={() => Linking.openURL(`tel:${clinic.phone}`)}>
            Llamar →
          </ThemedText>
        ) : null}
      </View>
    </Card>
  );
}

export function ScheduleView({ slots }: { slots: ScheduleSlot[] }) {
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <Card padding={Spacing.lg} contentStyle={styles.schedule}>
      {order.map((wd) => {
        const daySlots = slots.filter((s) => s.weekday === wd);
        return (
          <View key={wd} style={styles.scheduleRow}>
            <ThemedText variant="body" style={styles.scheduleDay}>
              {WEEKDAYS_LONG[wd]}
            </ThemedText>
            {daySlots.length ? (
              <View style={styles.scheduleRanges}>
                {daySlots.map((s) => (
                  <ThemedText key={s.id} variant="small" color="textSecondary">
                    {s.start} – {s.end}
                    {s.locationName ? ` · ${s.locationName}` : ''}
                  </ThemedText>
                ))}
              </View>
            ) : (
              <ThemedText variant="small" color="textMuted">
                Cerrado
              </ThemedText>
            )}
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  cover: {
    height: 120,
    width: '100%',
  },
  heroBody: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  avatarWrap: {
    marginTop: -42,
    marginBottom: Spacing.xs,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: Radius.pill,
  },
  avatarFallback: {
    width: 84,
    height: 84,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  price: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontFamily: Fonts.black,
    fontSize: 18,
  },
  services: {
    gap: Spacing.md,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  servicePrice: {
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  clinicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  clinicActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  schedule: {
    gap: Spacing.md,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  scheduleDay: {
    flex: 1,
  },
  scheduleRanges: {
    alignItems: 'flex-end',
    gap: 2,
  },
  flex: {
    flex: 1,
  },
});
