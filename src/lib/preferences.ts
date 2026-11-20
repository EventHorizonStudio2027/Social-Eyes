import AsyncStorage from '@react-native-async-storage/async-storage';

/** Onboarding completion is device-only; never changes venue visibility. */
const WELCOME_KEY = 'social-eyes:welcome-completed:v1';
export async function hasCompletedWelcome() {
  return (await AsyncStorage.getItem(WELCOME_KEY)) === 'true';
}
export async function markWelcomeComplete() {
  await AsyncStorage.setItem(WELCOME_KEY, 'true');
}
export async function resetWelcomeForTesting() {
  await AsyncStorage.removeItem(WELCOME_KEY);
}
