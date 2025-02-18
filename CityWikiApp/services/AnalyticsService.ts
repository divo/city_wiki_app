import * as Amplitude from '@amplitude/analytics-react-native';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized = false;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async initialize(userId: string) {
    if (this.initialized) return;
    
    try {
      await Amplitude.init('1722608f92b1d40c756a3ce859c45e11', userId);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Amplitude:', error);
    }
  }

  track(eventName: string, properties?: Record<string, any>) {
    if (!this.initialized) {
      console.warn('Analytics not initialized');
      return;
    }

    try {
      Amplitude.track(eventName, properties);
    } catch (error) {
      console.error('Failed to track event:', eventName, error);
    }
  }

  async flush() {
    if (!this.initialized) {
      console.warn('Analytics not initialized');
      return;
    }

    try {
      await Amplitude.flush();
    } catch (error) {
      console.error('Failed to flush events:', error);
    }
  }
}

export function track(event: string, properties?: Record<string, any>) {
  AnalyticsService.getInstance().track(event, properties);
}

export function flush() {
  return AnalyticsService.getInstance().flush();
} 