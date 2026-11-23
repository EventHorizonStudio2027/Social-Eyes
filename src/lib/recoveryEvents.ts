/** Preserve recovery restrictions until verification completes or signout succeeds. */
export function shouldClearRecoveryForAuthEvent(event: string, recoveryInFlight: boolean): boolean {
  return event === 'SIGNED_OUT' || (event === 'SIGNED_IN' && !recoveryInFlight);
}
