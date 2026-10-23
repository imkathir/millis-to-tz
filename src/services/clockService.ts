/**
 * ClockService — Ember-style singleton service for high-precision time tracking
 * Manages live ticks, freeze/pause state, time-travel offsets, and precision units.
 */

type Listener = (millis: number) => void;

class ClockService {
  private listeners: Set<Listener> = new Set();
  private intervalId: number | null = null;
  private isPaused: boolean = false;
  private currentMillis: number = Date.now();
  private manualOffsetMs: number = 0; // offset applied to real time

  constructor() {
    this.startTicker();
  }

  private startTicker() {
    if (typeof window === 'undefined') return;
    
    // Smooth 33ms interval (~30fps) for crisp millisecond rendering without CPU churn
    this.intervalId = window.setInterval(() => {
      if (!this.isPaused) {
        this.currentMillis = Date.now() + this.manualOffsetMs;
        this.notifyListeners();
      }
    }, 33);
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getEffectiveMillis());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const val = this.getEffectiveMillis();
    this.listeners.forEach((fn) => fn(val));
  }

  public getEffectiveMillis(): number {
    return this.currentMillis;
  }

  public pause(): void {
    this.isPaused = true;
    this.notifyListeners();
  }

  public resume(): void {
    this.isPaused = false;
    this.manualOffsetMs = 0;
    this.currentMillis = Date.now();
    this.notifyListeners();
  }

  public togglePause(): boolean {
    if (this.isPaused) {
      this.resume();
      return false;
    } else {
      this.pause();
      return true;
    }
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public setSpecificMillis(targetMillis: number): void {
    this.isPaused = true;
    this.currentMillis = targetMillis;
    this.notifyListeners();
  }

  public shiftTime(deltaMs: number): void {
    if (this.isPaused) {
      this.currentMillis += deltaMs;
    } else {
      this.manualOffsetMs += deltaMs;
      this.currentMillis = Date.now() + this.manualOffsetMs;
    }
    this.notifyListeners();
  }

  public resetToNow(): void {
    this.isPaused = false;
    this.manualOffsetMs = 0;
    this.currentMillis = Date.now();
    this.notifyListeners();
  }
}

export const clockService = new ClockService();
