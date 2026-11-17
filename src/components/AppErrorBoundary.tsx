import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

type State = { failed: boolean; attempts: number };
/** Last-resort UI containment. Never show exception details or user data on screen. */
export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { failed: false, attempts: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Intentionally do not log raw exceptions: SDK errors can contain sensitive context.
    // A redacted, opt-in crash reporter can be integrated after privacy review.
  }

  private retry = (): void => {
    this.setState(state => ({ failed: false, attempts: state.attempts + 1 }));
  };

  render(): ReactNode {
    if (!this.state.failed) {
      return <View key={this.state.attempts} style={styles.root}>{this.props.children}</View>;
    }
    return <View style={styles.fallback} accessibilityRole="alert">
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.description}>Social Eyes couldn't display this screen. Your account hasn't been signed out.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Try loading Social Eyes again" onPress={this.retry} style={styles.button}>
        <Text style={styles.buttonText}>Try again</Text>
      </Pressable>
    </View>;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fallback: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 16 },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  description: { color: theme.colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  button: { backgroundColor: theme.colors.violet, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
  buttonText: { color: theme.colors.text, fontWeight: '800' },
});
