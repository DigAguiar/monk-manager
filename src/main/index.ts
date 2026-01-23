 import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs' // <--- Importante para copiar arquivos

// --- IMPORTAÇÕES DO NOSSO BANCO DE DADOS ---
import { initDB, MonkDAO } from './db'
import { v4 as uuidv4 } from 'uuid'

// Função auxiliar para saber onde está o banco
const getDbPath = () => {
  return app.isPackaged
    ? join(app.getPath('userData'), 'monges.db')
    : join(__dirname, '../../monges.db')
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 1. Inicializa o Banco
  initDB()

  // 2. CRUD (Nomes atualizados para bater com o Preload)
  
  // Create
  ipcMain.handle('create-monk', async (_, data) => {
    try {
      const id = uuidv4()
      MonkDAO.create({ ...data, id })
      return { success: true, id }
    } catch (error: any) {
      console.error('Erro ao criar:', error)
      return { success: false, message: error.message }
    }
  })

  // Read
  ipcMain.handle('get-monks', async () => {
    try {
      return MonkDAO.getAll()
    } catch (error) {
      console.error('Erro ao buscar:', error)
      return []
    }
  })

  // Update
  ipcMain.handle('update-monk', async (_, data) => {
    try {
      MonkDAO.update(data)
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao atualizar:', error)
      return { success: false, message: error.message }
    }
  })

  // Delete
  ipcMain.handle('delete-monk', async (_, id) => {
    try {
      MonkDAO.delete(id)
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao deletar:', error)
      return { success: false, message: error.message }
    }
  })

  // --- 3. LÓGICA DE BACKUP E RESTORE (NOVO) ---

  // Exportar Banco (Backup)
  ipcMain.handle('backup-db', async () => {
    const dbPath = getDbPath()
    
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Salvar Backup do Banco de Dados',
      defaultPath: `backup_monges_${new Date().toISOString().slice(0,10)}.db`,
      filters: [{ name: 'Banco de Dados SQLite', extensions: ['db'] }]
    })

    if (canceled || !filePath) return false

    try {
      fs.copyFileSync(dbPath, filePath)
      return true
    } catch (error) {
      console.error('Erro ao fazer backup:', error)
      return false
    }
  })

  // Importar Banco (Restore)
  ipcMain.handle('restore-db', async () => {
    const dbPath = getDbPath()

    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Selecione o arquivo de Backup (.db)',
      filters: [{ name: 'Banco de Dados SQLite', extensions: ['db'] }],
      properties: ['openFile']
    })

    if (canceled || filePaths.length === 0) return false

    const backupFile = filePaths[0]

    try {
      // Substitui o arquivo atual pelo backup
      fs.copyFileSync(backupFile, dbPath)
      
      // Recarrega a janela para atualizar os dados na tela
      const win = BrowserWindow.getAllWindows()[0]
      if (win) win.reload()
      
      return true
    } catch (error) {
      console.error('Erro ao restaurar:', error)
      return false
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})