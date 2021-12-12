import {app, BrowserWindow, ipcMain, screen, Menu} from 'electron'
import {createSettingsWindow} from './createwindows'
import { WebSocketServer } from 'ws'
import {HSWWData} from '../@types/hyper'
import log from 'electron-log'
import {homedir} from 'os'
import {join} from 'path'
import {Config} from '../shared/config'
const logger = log.scope("IPC")

log.transports.file.resolvePath = () => join(homedir(), '.hyperbar/logs/main.log');

function startIPC(windows: {[key: string]: BrowserWindow}) {
    logger.debug("Initializing")

    const wss = new WebSocketServer({ port: 49737})

    wss.on('connection', function (ws) {
    
        ws.on('message', function (message: string) {
            // console.log("HYPER :: WEBSOCKET :: Received message => ".concat(message));
            logger.debug(`Websocket message: ${message}`)
            try {
                const data = JSON.parse(message) as HSWWData           
                Object.keys(windows).forEach( name => {
                    const windowObj = windows[name]
                    if (windowObj) {
                        windowObj.webContents.send(`hws_${data.Event}`, data)
                    }
                })
            } catch {
                console.log("Invalid json", String(message) )
            }
        })
    
        wss.on('close', function (this) {
            console.log("Connection was closed")
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

    ipcMain.on('closeSettings', () => {
        windows?.settings?.close()
    })
    
    ipcMain.on('updateComposition', (_, composition) => {
    
    })
    
    ipcMain.on('windowMoving', (e, {mouseX, mouseY}: {mouseX: number, mouseY:number} ) => {
        const { x, y } = screen.getCursorScreenPoint()
        windows.settings.setPosition(x - mouseX, y - mouseY)
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
        const template = [
          { label: 'Restart Hyper', click: () => { ipcMain.emit('refreshApp') } },
          { label: 'Close Hyper', click: () => { ipcMain.emit('closeApp') } },
          { type: 'separator' },
          { label: 'Open Settings', click: () => { ipcMain.emit('openSettings') } },
          { label: 'HyperTS - Hyper '}
        ]
    
        const config = new Config()
        // If the user settings doesn't allow to display debug settings
        // then we just remove it from the array.
        if (!config.getValue('general','misc', "context-menu")) {
          delete template[0]
          delete template[1]
        }
        //@ts-expect-error
        const menu = Menu.buildFromTemplate(template)
        menu.popup()
      })
}

export default startIPC;