import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader } from '@/components/BrandHeader';
import { Panel } from '@/components/Panel';
import { Screen } from '@/components/Screen';
import { theme } from '@/constants/theme';
import { isBackendConfigured } from '@/lib/supabase';

export default function DiscoverScreen() {
  return (
    <Screen>
      <BrandHeader eyebrow="Discover tonight" />
      <View style={styles.hero}>
        <Text style={styles.kicker}>SEE BEFORE YOU GO</Text>
        <Text style={styles.title}>Where's the{ '\n' }energy?</Text>
        <Text style={styles.subtitle}>Find participating places, discover who's around, and make your next night out more social.</Text>
      </View>
      <View style={styles.status} accessibilityRole="text" accessibilityLabel={isBackendConfigured ? "Backend configured, live venue discovery not verified" : "Offline development preview, live venue discovery unavailable"}><View style={styles.dot} /><Text style={styles.statusText}>{isBackendConfigured ? 'Backend credentials configured · live connection not yet verified' : 'Development preview · backend not connected'}</Text></View>
      <Panel>
        <View style={styles.panelTop}>
          <View style={styles.iconCircle}><Ionicons name="map-outline" size={21} color={theme.colors.cyan} /></View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.panelTitle}>Your nearby scene</Text>
            <Text style={styles.body}>Live venue discovery is not available yet.</Text>
          </View>
          <Text style={styles.soon}>NEXT</Text>
        </View>
        <Text style={styles.body}>Venue lists, check-ins and crowd activity remain disabled until backend permissions and real data are verified. Your presence is not shared by this screen.</Text>
      </Panel>
      <Panel>
        <Text style={styles.panelTitle}>How Social Eyes works</Text>
        <Feature icon="location-outline" title="Choose a venue" description="Discover places and events worth going to." />
        <Feature icon="radio-outline" title="Opt into presence" description="Check in when you want others to see you." />
        <Feature icon="eye-outline" title="Make a mutual connection" description="Interest stays private unless it's returned." />
      </Panel>
    </Screen>
  );
}

function Feature({ icon, title, description }: { icon: keyof typeof Ionicons.glyphMap; title: string; description: string }) {
  return <View style={styles.feature}><Ionicons name={icon} size={20} color={theme.colors.violet} /><View style={{ flex: 1, gap: 2 }}><Text style={styles.featureTitle}>{title}</Text><Text style={styles.body}>{description}</Text></View></View>;
}

const styles = StyleSheet.create({
  hero: { paddingTop: 16, paddingBottom: 8, gap: 10 },
  kicker: { color: theme.colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  title: { color: theme.colors.text, fontSize: 43, lineHeight: 46, letterSpacing: -2.2, fontWeight: '900' },
  subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 22, maxWidth: 360 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#142235', borderWidth: 1, borderColor: '#25364A' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.gold },
  statusText: { flexShrink: 1, color: theme.colors.muted, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  panelTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#13283A', borderWidth: 1, borderColor: '#24485A', alignItems: 'center', justifyContent: 'center' },
  panelTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '800' },
  body: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 },
  soon: { color: theme.colors.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 1.4, overflow: 'hidden' },
  feature: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 8 },
  featureTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
});
