/** Only foreground activity should initiate a reachability refresh. */
export function backendLifecycleAction(state: string): 'refresh' | 'invalidate' {
  return state === 'active' ? 'refresh' : 'invalidate';
}
