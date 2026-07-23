import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ReviewCard } from '@/components/review-card';
import { ThemedText } from '@/components/themed-text';
import {
  ClinicCard,
  HeroCard,
  ScheduleView,
  ServicesList,
} from '@/components/profile-sections';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Rating } from '@/components/ui/rating';
import { SectionHeader } from '@/components/ui/section-header';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Doctor, Review } from '@/types';

type Props = {
  doctor: Doctor;
  reviews?: Review[];
  preview?: boolean;
};

export function DoctorPublicProfile({ doctor, reviews = [], preview }: Props) {
  const { colors } = useTheme();
  const primaryService = doctor.services.find((s) => s.isActive);

  return (
    <>
      {preview ? (
        <Card padding={Spacing.md} tone="strong" contentStyle={styles.previewBanner}>
          <ThemedText variant="small" color="textSecondary">
            Vista previa — así te ven los pacientes en el directorio OptiSave.
          </ThemedText>
        </Card>
      ) : null}

      <HeroCard doctor={doctor} />

      {doctor.bio ? (
        <View style={styles.section}>
          <SectionHeader title="Sobre mí" />
          <Card padding={Spacing.lg}>
            <ThemedText variant="body" color="textSecondary" style={styles.statement}>
              {doctor.bio}
            </ThemedText>
          </Card>
        </View>
      ) : null}

      {doctor.specialties.length > 1 ? (
        <View style={styles.section}>
          <SectionHeader title="Especialidades" />
          <View style={styles.wrap}>
            {doctor.specialties.map((s) => (
              <Chip key={s.id} label={s.name} tone="primary" />
            ))}
          </View>
        </View>
      ) : null}

      {doctor.licenseNumber ? (
        <View style={styles.section}>
          <SectionHeader title="Cédula profesional" />
          <Card padding={Spacing.lg}>
            <ThemedText variant="body">N.º {doctor.licenseNumber}</ThemedText>
          </Card>
        </View>
      ) : null}

      {doctor.services.length ? (
        <View style={styles.section}>
          <SectionHeader title="Servicios y costos" />
          <ServicesList services={doctor.services.filter((s) => s.isActive)} />
        </View>
      ) : null}

      {doctor.clinics.length ? (
        <View style={styles.section}>
          <SectionHeader title="Consultorios" />
          <View style={styles.list}>
            {doctor.clinics.map((c) => (
              <ClinicCard key={c.id} clinic={c} />
            ))}
          </View>
        </View>
      ) : null}

      {doctor.schedule.length ? (
        <View style={styles.section}>
          <SectionHeader title="Horarios de atención" subtitle="Informativos — no reservables desde el directorio" />
          <ScheduleView slots={doctor.schedule} />
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="Opiniones de pacientes" subtitle={`${doctor.ratingCount} reseñas`} />
        <Card padding={Spacing.lg} contentStyle={styles.reviewSummary}>
          <View>
            <ThemedText style={[styles.bigRating, { color: colors.text }]}>
              {doctor.ratingAvg.toFixed(1)}
            </ThemedText>
            <Rating value={doctor.ratingAvg} showValue={false} />
          </View>
          <View style={styles.flex}>
            <ThemedText variant="small" color="textSecondary">
              Promedio basado en {doctor.ratingCount} opiniones verificadas.
            </ThemedText>
          </View>
        </Card>
        <View style={styles.list}>
          {reviews.slice(0, 5).map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </View>
      </View>

      {!doctor.isActive ? (
        <Card padding={Spacing.lg} contentStyle={styles.hiddenNotice}>
          <ThemedText variant="small" color="warning">
            Tu perfil está oculto en el directorio. Actívalo desde el panel para que los pacientes te encuentren.
          </ThemedText>
        </Card>
      ) : null}

      {primaryService ? null : (
        <Image source={require('@/assets/images/baner.png')} style={styles.banner} contentFit="cover" />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  previewBanner: {
    alignItems: 'center',
  },
  statement: {
    lineHeight: 24,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  list: {
    gap: Spacing.md,
  },
  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  bigRating: {
    fontFamily: Fonts.black,
    fontSize: 40,
  },
  flex: {
    flex: 1,
  },
  hiddenNotice: {
    alignItems: 'center',
  },
  banner: {
    width: '100%',
    height: 120,
    borderRadius: 16,
  },
});
