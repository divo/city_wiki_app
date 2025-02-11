import { offlineManager } from '@rnmapbox/maps';

type ProgressListener = (offlinePack: any, status: any) => void;
type ErrorListener = (offlinePack: any, error: any) => void;

export interface OfflineCreatePackOptions {
  name: string;
  styleURL: string;
  minZoom: number;
  maxZoom: number;
  bounds: [[number, number], [number, number]];
}

export class OfflineMapService {
  private static instance: OfflineMapService;

  private constructor() {
    // Set progress event throttle to 100ms for more frequent updates
    offlineManager.setProgressEventThrottle(100);
  }

  public static getInstance(): OfflineMapService {
    if (!OfflineMapService.instance) {
      OfflineMapService.instance = new OfflineMapService();
    }
    return OfflineMapService.instance;
  }

  public async createPack(
    options: OfflineCreatePackOptions,
    progressListener?: ProgressListener,
    errorListener?: ErrorListener
  ): Promise<any> {
    return await offlineManager.createPack(
      options,
      progressListener || (() => {}),
      errorListener || (() => {})
    );
  }

  public async getPacks(): Promise<any[]> {
    return await offlineManager.getPacks();
  }

  public async clearData(): Promise<void> {
    console.log('Clearing offline map data');
    await offlineManager.resetDatabase();
  }

  public async subscribe(
    packName: string,
    progressListener: ProgressListener,
    errorListener: ErrorListener
  ): Promise<void> {
    await offlineManager.subscribe(packName, progressListener, errorListener);
  }

  public async unsubscribe(packName: string): Promise<void> {
    await offlineManager.unsubscribe(packName);
  }

  public async deletePack(packName: string): Promise<void> {
    await offlineManager.deletePack(packName);
  }

  public async invalidatePack(packName: string): Promise<void> {
    await offlineManager.invalidatePack(packName);
  }
} 