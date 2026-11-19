/** Recovery sessions remain gated until explicit signout or a non-recovery sign-in. */
export function shouldClearRecoveryForAuthEvent(event: string, verificationInFlight: boolean): boolean {
  if (event === 'SIGNED_OUT') return true;
  return event === 'SIGNED_IN' && !verificationInFlight;
}
