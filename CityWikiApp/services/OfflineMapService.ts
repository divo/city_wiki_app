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
    // private to enforce singleton pattern
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
} 