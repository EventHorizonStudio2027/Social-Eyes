import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader } from '@/components/BrandHeader';
import { Panel } from '@/components/Panel';
import { Screen } from '@/components/Screen';
import { theme } from '@/constants/theme';

export default function EyesScreen() {
  return (
    <Screen>
      <BrandHeader eyebrow="Your connections" />
      <View style={{ paddingTop: 17, gap: 8 }}>
        <Text style={styles.title}>Eyes on you.</Text>
        <Text style={styles.subtitle}>Mutual interest appears here only after both people independently choose each other.</Text>
      </View>
      <View style={styles.emptyCard}>
        <View style={styles.eye}><Ionicons name="eye-outline" size={30} color={theme.colors.cyan} /></View>
        <Text style={styles.heading}>Your connections will appear here</Text>
        <Text style={styles.copy}>When you and another person both express interest, you'll have a private mutual connection.</Text>
      </View>
      <Panel><Text style={styles.panelTitle}>No one gets notified about a one-sided Eye.</Text><Text style={styles.copy}>Your interest stays private unless the other person chooses you too.</Text></Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontSize: 35, fontWeight: '900', letterSpacing: -1.5 },
  subtitle: { color: theme.colors.muted, fontSize: 13, lineHeight: 20 },
  emptyCard: { minHeight: 300, justifyContent: 'center', alignItems: 'center', padding: 28, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 25, backgroundColor: theme.colors.surface, gap: 12 },
  eye: { width: 70, height: 70, borderRadius: 24, backgroundColor: '#13283A', alignItems: 'center', justifyContent: 'center' },
  heading: { color: theme.colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  copy: { color: theme.colors.muted, fontSize: 12, lineHeight: 19, textAlign: 'center' },
  panelTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '800' },
});
