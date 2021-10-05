import {app, BrowserWindow, ipcMain, screen, Menu} from 'electron';
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
    
    ipcMain.on('windowMoving', (e, {mouseX, mouseY}: {mouseX: number, mouseY:number} ) => {
        const { x, y } = screen.getCursorScreenPoint()
        windows.settings.setPosition(x - mouseX, y - mouseY)
    });
    
    ipcMain.on('windowMoved', () => {
    
    })

    ipcMain.on('refreshApp', () => {
        app.relaunch()
        app.exit()
    })

    ipcMain.on('show-context-menu', (event) => {
        const template = [
            {
              label: 'Restart Hyper',
                click: () => {
                    app.relaunch()
                    app.exit()
                }
            },
            { label: 'Close Hyper',
                click: () => {
                    app.quit()
                }
            },
            { type: 'separator' },
            { 
                label: 'Open Settings',
                click: () => {
                    createSettingsWindow(windows)
                }
            }
            
          ]
          //@ts-ignore
          const menu = Menu.buildFromTemplate(template)
          //@ts-ignore
          menu.popup(BrowserWindow.fromWebContents(event.sender))
    })
}

export default startIPC;