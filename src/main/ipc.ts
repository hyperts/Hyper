import {app, BrowserWindow, ipcMain, screen, Menu} from 'electron'
import {createSettingsWindow} from './createwindows'
import {createServer} from 'net'
import {HSWWData} from '../@types/hyper'

import log from 'electron-log'
import {homedir} from 'os'
import {join} from 'path'
const logger = log.scope("IPC")

log.transports.file.resolvePath = () => join(homedir(), '.hyperbar/logs/main.log');

function startIPC(windows: {[key: string]: BrowserWindow}) {

    const PIPE_NAME = "hyper"
    const PIPE_PATH = "\\\\.\\pipe\\" + PIPE_NAME

    const server = createServer(function(stream: any) {
        logger.debug('PIPE :: Hyper initialized')

        stream.on('data', function(c: any) {
            const data = JSON.parse(c.toString()) as HSWWData            
            windows?.main.webContents.send(`hws_${data.Event}`, data)
        });

        stream.on('end', function() {
            logger.debug('PIPE :: Connection ended')
            server.close();
        });

        stream.write('PIPE :: Soft landed');
    });

    server.on('close',function(){
        logger.debug('PIPE :: Server closed')
    })

    server.listen(PIPE_PATH,function(){
        // console.log('Server :: listening')
    })



    // Pipe client, just in case...
    // var client = connect(PIPE_PATH, function() {
    //     console.log('Client :: connected');
    // })

    // client.on('data', function(data: any) {
    //     // console.log('Client: data:', data.toString());
    // });

    // client.on('end', function() {
    //     // console.log('Client :: ended');
    // })

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