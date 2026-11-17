import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { markWelcomeComplete } from '@/lib/preferences';

export default function WelcomeScreen() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const continueToApp = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await markWelcomeComplete();
      router.replace('/(tabs)');
    } catch {
      setError('We could not save your welcome progress. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.orb}><Image source={require('../assets/images/social-eyes-mark.png')} style={styles.welcomeMark} accessibilityLabel="Social Eyes eye logo" /></View>
      <View style={styles.content}>
        <Text style={styles.brand}>Social <Text style={{ color: theme.colors.cyan }}>Eyes</Text></Text>
        <Text style={styles.kicker}>SEE BEFORE YOU GO</Text>
        <Text style={styles.title}>The social layer{'\n'}over real life.</Text>
        <Text style={styles.copy}>Discover who's out, get a feel for the room, and make a connection before you cross it.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Explore Social Eyes" disabled={saving} onPress={() => { void continueToApp(); }} style={[styles.button, saving && styles.disabled]}>
          {saving ? <ActivityIndicator color="#06111B" /> : <Text style={styles.buttonText}>Explore Social Eyes  →</Text>}
        </Pressable>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Text style={styles.note}>A new way to connect in the real world.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'flex-end', padding: 25 },
  orb: { position: 'absolute', top: '13%', alignSelf: 'center', width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: '#23475B', alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.cyan, shadowOpacity: 0.22, shadowRadius: 55 },
  welcomeMark: { width: 210, height: 210, borderRadius: 46 },
  orbInner: { width: 155, height: 155, borderRadius: 78, borderWidth: 1, borderColor: '#3C3567', alignItems: 'center', justifyContent: 'center' },
  orbCore: { width: 76, height: 76, borderRadius: 38, borderWidth: 1, borderColor: '#70476E', backgroundColor: '#10182A' },
  content: { gap: 13, paddingBottom: 20 },
  brand: { color: theme.colors.text, fontSize: 43, fontWeight: '900', letterSpacing: -2.2 },
  kicker: { color: theme.colors.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 2.2, marginTop: 6 },
  title: { color: theme.colors.text, fontSize: 43, lineHeight: 46, letterSpacing: -2, fontWeight: '900' },
  copy: { color: theme.colors.muted, fontSize: 14, lineHeight: 22, marginBottom: 12 },
  button: { backgroundColor: theme.colors.cyan, borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  disabled: { opacity: 0.7 },
  buttonText: { color: '#06111B', fontWeight: '900', fontSize: 14 },
  error: { color: '#FF9DAD', fontSize: 13, textAlign: 'center' },
  note: { color: theme.colors.faint, fontSize: 10, textAlign: 'center', marginTop: 4 },
});
