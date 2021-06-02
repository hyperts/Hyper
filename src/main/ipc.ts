import {app, BrowserWindow, ipcMain, screen} from 'electron';
import { createSettingsWindow } from './createwindows'

function startIPC(windows: {[key: string]: BrowserWindow}) {
    app.on('window-all-closed', () => {
       app.quit()
    })
    
    ipcMain.on('openSettings', () => {
        console.log("Requesting to open settings window.")
        createSettingsWindow(windows)
    })

    ipcMain.on('closeSettings', () => {
        console.log("Closing settings window")
        windows?.settings?.close()
    })
    
    ipcMain.on('updateComposition', (_, composition) => {
    
    })
    
    ipcMain.on('windowMoving', (e, {mouseX, mouseY}) => {
        const { x, y } = screen.getCursorScreenPoint()
        windows.settings.setPosition(x - mouseX, y - mouseY)
    });
    
    ipcMain.on('windowMoved', () => {
    
    })

    ipcMain.on('refreshApp', () => {
        app.relaunch()
        app.exit()
    })
}

export default startIPC;