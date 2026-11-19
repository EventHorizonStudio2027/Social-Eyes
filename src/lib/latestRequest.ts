/** Monotonic request generation; stale async results must not update UI. */
export class LatestRequest {
  private generation = 0;
  private disposed = false;
  begin(): number { return ++this.generation; }
  isCurrent(generation: number): boolean { return !this.disposed && generation === this.generation; }
  invalidate(): void { this.generation++; }
  dispose(): void { this.disposed = true; this.invalidate(); }
}
