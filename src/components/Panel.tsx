import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '@/constants/theme';

export function Panel({ children }: PropsWithChildren) {
  return <View style={styles.panel}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: theme.colors.surface,
    borderColor: '#294158',
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: 18,
    gap: 12,
    shadowColor: '#050C18',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
