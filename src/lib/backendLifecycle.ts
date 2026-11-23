/** Only a foregrounded application should publish backend reachability. */
export function backendLifecycleAction(state: string): 'refresh' | 'invalidate' {
  return state === 'active' ? 'refresh' : 'invalidate';
}
