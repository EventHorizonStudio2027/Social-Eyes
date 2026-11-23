import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader } from '@/components/BrandHeader';
import { Panel } from '@/components/Panel';
import { Screen } from '@/components/Screen';
import { theme } from '@/constants/theme';

export default function RadarScreen() {
  return (
    <Screen>
      <BrandHeader eyebrow="Venue radar" />
      <View style={{ gap: 8, paddingTop: 16 }}>
        <Text style={styles.title}>See the room.</Text>
        <Text style={styles.subtitle}>This preview shows the planned zone layout. Live presence is not available yet.</Text>
      </View>
      <View style={styles.map}>
        <View style={styles.room} />
        <Text style={[styles.zone, { top: '23%', left: '17%' }]}>BAR</Text>
        <Text style={[styles.zone, { top: '46%', right: '15%' }]}>PATIO</Text>
        <Text style={[styles.zone, { bottom: '25%', left: '31%' }]}>SOCIAL FLOOR</Text>
        <View style={styles.empty}><Ionicons name="radio-outline" size={34} color={theme.colors.cyan} /><Text style={styles.emptyTitle}>Radar activates at a venue</Text><Text style={styles.emptyBody}>Venue check-in and live presence are not connected yet. This is an illustrative layout, not a live map.</Text></View>
      </View>
      <Panel><Text style={styles.panelTitle}>Privacy by design</Text><Text style={styles.body}>Live radar is disabled. When implemented, it must use opt-in, approximate zones and must never reveal exact GPS coordinates.</Text></Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontSize: 32, fontWeight: '900', letterSpacing: -1.3 },
  subtitle: { color: theme.colors.muted, fontSize: 13, lineHeight: 20 },
  map: { minHeight: 340, height: 390, borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, backgroundColor: '#0C1422', position: 'relative' },
  room: { position: 'absolute', top: '16%', left: '9%', right: '9%', bottom: '14%', borderWidth: 2, borderColor: '#385574', borderRadius: 28 },
  zone: { position: 'absolute', color: '#9DB0CB', fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  empty: { position: 'absolute', top: '31%', left: 24, right: 24, alignItems: 'center', gap: 10, paddingVertical: 20, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#101D31' },
  emptyTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  emptyBody: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  panelTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '800' },
  body: { color: theme.colors.muted, fontSize: 12, lineHeight: 19 },
});
