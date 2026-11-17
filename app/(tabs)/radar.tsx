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
        <Text style={styles.subtitle}>A live, approximate view of people who have chosen to be visible at the same venue.</Text>
      </View>
      <View style={styles.map}>
        <View style={styles.room} />
        <Text style={[styles.zone, { top: '23%', left: '17%' }]}>BAR</Text>
        <Text style={[styles.zone, { top: '46%', right: '15%' }]}>PATIO</Text>
        <Text style={[styles.zone, { bottom: '25%', left: '31%' }]}>SOCIAL FLOOR</Text>
        <View style={styles.empty}><Ionicons name="radio-outline" size={34} color={theme.colors.cyan} /><Text style={styles.emptyTitle}>Radar activates at a venue</Text><Text style={styles.emptyBody}>Check into a participating venue to see its available zones and opted-in people.</Text></View>
      </View>
      <Panel><Text style={styles.panelTitle}>Privacy by design</Text><Text style={styles.body}>The radar will use approximate, zone-based positions first. It will never expose someone's exact GPS coordinates.</Text></Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontSize: 32, fontWeight: '900', letterSpacing: -1.3 },
  subtitle: { color: theme.colors.muted, fontSize: 13, lineHeight: 20 },
  map: { height: 420, borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border, backgroundColor: '#0C1422', position: 'relative' },
  room: { position: 'absolute', top: '16%', left: '9%', right: '9%', bottom: '14%', borderWidth: 2, borderColor: '#344665', borderRadius: 28 },
  zone: { position: 'absolute', color: '#62728F', fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  empty: { position: 'absolute', top: '34%', left: 30, right: 30, alignItems: 'center', gap: 10 },
  emptyTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  emptyBody: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  panelTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '800' },
  body: { color: theme.colors.muted, fontSize: 12, lineHeight: 19 },
});
