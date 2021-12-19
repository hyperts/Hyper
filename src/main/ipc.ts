import {app, BrowserWindow, ipcMain, screen, Menu} from 'electron'
import { createSettingsWindow, createExtensionWindow, createDebugWindow } from './createwindows';
import { WebSocketServer } from 'ws'
import {HSWWData} from '../@types/hyper'
import log from 'electron-log'
import {homedir} from 'os'
import {join} from 'path'
import {Config} from '../shared/config'
import { Logger } from '../shared/logger';
const logger = new Logger('[MAIN] IPC')

log.transports.file.resolvePath = () => join(homedir(), '.hyperlogs/main.log');

function startIPC(windows: {[key: string]: BrowserWindow}) {
    logger.debug("Initializing")

    const wss = new WebSocketServer({ port: 49737})

    wss.on('connection', function (ws) {
    
        ws.on('message', function (message: string) {
            try {
                const data = JSON.parse(message) as HSWWData           
                Object.keys(windows).forEach( name => {
                    const windowObj = windows[name]
                    if (windowObj) {
                        windowObj.webContents.send(`hws_${data.Event}`, data)
                    }
                })
            } catch {
                logger.error("Invalid JSON received via IPC WS")
            }
        })
    
        wss.on('close', function (this) {
            logger.error("Connection closed -> <-")
        })

        // Listen to sendSocket only when socket state is READY (1)
        ipcMain.on('sendSocketMessage', (event, {event_name, data_message}: {event_name: string, data_message: string}) => {
            wss.clients.forEach( client => {
                client.send(JSON.stringify({event_name, data_message}))
            })
        })
    })
    
    app.on('window-all-closed', () => {
       app.quit()
    })
    
    ipcMain.on('openSettings', () => {
        createSettingsWindow(windows)
    })

    ipcMain.on('openExtensions', (e, tutorial?: boolean) => {
        createExtensionWindow(windows, tutorial ?? false)
    })

    ipcMain.on('showWelcomeScreen', ()=>{
        createExtensionWindow(windows, true)
    })

    ipcMain.on('extensionWindowHideTutorial', (e) =>{
        if (windows.extension) {
            windows.extension.webContents.send('extensionWindowHideTutorial')
            return
        }
    })

    ipcMain.on('refreshExtensionWindow', () => {
        windows?.extension?.close()
        createExtensionWindow(windows, false)
    })

    ipcMain.on('closeExtensionWindow', () => {
        windows?.extension?.close()
    })
    
    ipcMain.on('openConsole', ()=>{
        createDebugWindow(windows)
    })

        
    ipcMain.on('h_logmessage', (e,data)=> {
        windows?.console.webContents.send('h_logmessage', data)
    })
  

    ipcMain.on('closeSettings', () => {
        windows?.settings?.close()
    })
    
    ipcMain.on('updateComposition', (_, composition) => {
    
    })
    
    ipcMain.on('moveSettingsWindow', (e, {mouseX, mouseY}: {mouseX: number, mouseY:number} ) => {
        const { x, y } = screen.getCursorScreenPoint()
        windows.settings.setPosition(x - mouseX, y - mouseY)
    });

    ipcMain.on('moveExtensionWindow', (e, {mouseX, mouseY}: {mouseX: number, mouseY:number} ) => {
        const { x, y } = screen.getCursorScreenPoint()
        windows.extension.setPosition(x - mouseX, y - mouseY)
    });

    ipcMain.on('refreshApp', () => {
        app?.relaunch()
        app?.exit()
    })

    ipcMain.on('closeApp', () => {
        app?.exit()
    })

    ipcMain.on('forceReload', () => { 
        for (const windowName in windows) {
            const window = windows[windowName]
            window?.webContents?.reloadIgnoringCache()
        }
    })

    ipcMain.on('getCursorPosition', (e, window) => {
        const {x, y} = screen.getCursorScreenPoint()
        if (window) {
            window.webContents.send('sendCursorPosition', {x, y})
            return
        }
        ipcMain.emit('sendCursorPosition', {x, y})
    })

    ipcMain.on('getScreenSize', (e, window) =>{
        const primaryDisplay = screen.getPrimaryDisplay()
        const { width: w, height: h } = primaryDisplay.workAreaSize
        if (window) {
            window.webContents.send('sendScreenSize', {w, h})
            return
        }
        ipcMain.emit('sendScreenSize', {w, h})
    })

    ipcMain.on('show-context-menu', (event) => {
        // Create context menu on message
        let template = [
          { label: 'Restart', click: () => { ipcMain.emit('refreshApp') } },
          { label: 'Exit', click: () => { ipcMain.emit('closeApp') } },
          { label: 'Debug Console', click:()=>{ipcMain.emit('openConsole')}},
          { type: 'separator' },
          { label: 'Install Themes/Extensions', click: () =>{ ipcMain.emit('openExtensions', true) } },
          { label: 'Settings', click: () => { ipcMain.emit('openSettings') } },
          { type: 'separator' },
          { label: 'Hyper - Beta release'}
        ]
    
        const config = new Config()
        // If the user settings doesn't allow to display debug settings
        // then we just remove it from the array.
        if (!config.getValue('general', 'misc', "context-menu")) {
          delete template[0]
        //   delete template[1]
          delete template[2]
        //   delete template[3]
        }
        //@ts-expect-error
        const menu = Menu.buildFromTemplate(template)
        menu.popup()
      })
}

export default startIPC;