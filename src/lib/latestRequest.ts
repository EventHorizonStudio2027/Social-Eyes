/** Prevent stale asynchronous responses from overwriting newer state. */
export class LatestRequest {
  private generation = 0;
  private disposed = false;
  begin(): number { if (!this.disposed) this.generation += 1; return this.generation; }
  isCurrent(generation: number): boolean { return !this.disposed && generation === this.generation; }
  invalidate(): void { this.generation += 1; }
  dispose(): void { this.disposed = true; this.invalidate(); }
}
