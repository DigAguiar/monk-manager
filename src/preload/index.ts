import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getAllMonks: () => ipcRenderer.invoke('get-monks'),
  createMonk: (monk: any) => ipcRenderer.invoke('create-monk', monk),
  updateMonk: (monk: any) => ipcRenderer.invoke('update-monk', monk),
  deleteMonk: (id: string) => ipcRenderer.invoke('delete-monk', id),
  
  // NOVOS COMANDOS DE BACKUP
  backupDB: () => ipcRenderer.invoke('backup-db'),
  restoreDB: () => ipcRenderer.invoke('restore-db')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}