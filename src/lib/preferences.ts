import AsyncStorage from '@react-native-async-storage/async-storage';
const key = 'social-eyes:welcome:v1';
export async function hasCompletedWelcome(): Promise<boolean> {
  const saved = await AsyncStorage.getItem(key);
  return saved === 'true';
}
export async function markWelcomeComplete(): Promise<void> {
  await AsyncStorage.setItem(key, 'true');
}
export async function resetWelcomeForTesting(): Promise<void> {
  await AsyncStorage.removeItem(key);
}
