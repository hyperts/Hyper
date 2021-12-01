import {app, BrowserWindow, ipcMain, screen} from 'electron'
import {createSettingsWindow} from './createwindows'
import { WebSocketServer } from 'ws'
import {HSWWData} from '../@types/hyper'
import log from 'electron-log'
import {homedir} from 'os'
import {join} from 'path'
const logger = log.scope("IPC")

log.transports.file.resolvePath = () => join(homedir(), '.hyperbar/logs/main.log');

function startIPC(windows: {[key: string]: BrowserWindow}) {
    logger.debug("Initializing")

    const wss = new WebSocketServer({ port: 49737})

    wss.on('connection', function (ws) {
    
        ws.on('message', function (message: string) {
            // console.log("HYPER :: WEBSOCKET :: Received message => ".concat(message));
            logger.debug(`Websocket message: ${message}`)
            const data = JSON.parse(message) as HSWWData            
            windows?.main.webContents.send(`hws_${data.Event}`, data)
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

    ipcMain.on('refreshApp', () => {
        app.relaunch()
        app.exit()
    })

    ipcMain.on('forceReload', () => { 
        for (const windowName in windows) {
            const window = windows[windowName]
            window?.webContents?.reloadIgnoringCache()
        }
    })
}

export default startIPC;