import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

export function BrandHeader({ eyebrow }: { eyebrow: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.brandRow}><Image source={require('../../assets/images/social-eyes-mark.png')} style={styles.mark} accessibilityLabel="Social Eyes eye logo" /><Text style={styles.brand}>Social <Text style={styles.accent}>Eyes</Text></Text></View>
      <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 3 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { width: 32, height: 32, borderRadius: 8 },
  brand: { color: theme.colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -1.1 },
  accent: { color: theme.colors.cyan },
  eyebrow: { color: theme.colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.8 },
});
