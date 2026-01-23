import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      createMonk: (data: any) => Promise<{ success: boolean; id?: string; message?: string }>;
      getAllMonks: () => Promise<any[]>;
      updateMonk: (data: any) => Promise<{ success: boolean; message?: string }>;
      deleteMonk: (id: string) => Promise<{ success: boolean; message?: string }>;
    }
  }
}