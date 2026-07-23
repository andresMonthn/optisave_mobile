import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Fonts, FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type InputProps = TextInputProps & {
  label?: string;
  icon?: IconName;
  error?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

/** Filled, borderless input (product rule: no borders). Focus is shown by a soft background shift. */
export function Input({
  label,
  icon,
  error,
  hint,
  containerStyle,
  style,
  secureTextEntry,
  multiline,
  ...rest
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <ThemedText variant="small" color="textSecondary" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <View
        style={[
          styles.field,
          {
            backgroundColor: focused ? colors.primarySoft : colors.backgroundAlt,
            alignItems: multiline ? 'flex-start' : 'center',
            minHeight: multiline ? 96 : 52,
          },
        ]}>
        {icon ? (
          <Icon name={icon} size={18} tint={focused ? colors.primary : colors.textMuted} />
        ) : null}
        <TextInput
          style={[
            styles.input,
            { color: colors.text, fontFamily: Fonts.regular },
            multiline ? styles.multiline : null,
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {secureTextEntry ? (
          <Icon
            name={hidden ? 'eye-outline' : 'eye-off-outline'}
            size={18}
            tint={colors.textMuted}
          />
        ) : null}
      </View>
      {error ? (
        <ThemedText variant="caption" color="danger" style={styles.helper}>
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText variant="caption" color="textMuted" style={styles.helper}>
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    fontFamily: Fonts.bold,
    marginLeft: Spacing.xs,
  },
  field: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    padding: 0,
  },
  multiline: {
    textAlignVertical: 'top',
    minHeight: 72,
  },
  helper: {
    marginLeft: Spacing.xs,
  },
});
