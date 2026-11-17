import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { hasCompletedWelcome } from '@/lib/preferences';
import { theme } from '@/constants/theme';

export default function Index() {
  const [destination, setDestination] = useState<'welcome' | '(tabs)' | null>(null);

  useEffect(() => {
    let mounted = true;
    hasCompletedWelcome()
      .then((complete) => { if (mounted) setDestination(complete ? '(tabs)' : 'welcome'); })
      .catch(() => { if (mounted) setDestination('welcome'); });
    return () => { mounted = false; };
  }, []);

  if (destination) return <Redirect href={destination === 'welcome' ? '/welcome' : '/(tabs)'} />;
  return <View style={styles.loading}><ActivityIndicator color={theme.colors.cyan} size="large" /></View>;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background } });
