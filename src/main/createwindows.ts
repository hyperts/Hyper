import { app, BrowserWindow, shell } from "electron";
import ewc from 'ewc';
import logger from 'electron-timber'

export function createWindows(windows) {
  
    windows.main = new BrowserWindow({
        width: 400, 
        height: 400, 
        minimizable: false,
        alwaysOnTop: true,
        thickFrame: false,
        backgroundColor: '#00000000',
        hasShadow: false,
        resizable: false,
        skipTaskbar: true,
        focusable: true,
        fullscreenable: false,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    windows.main.loadFile('./dist/index.html')

    windows.settings = new BrowserWindow({
        width: 900, 
        height: 500, 
        show: false, 
        frame: false,
        minimizable: true,
        thickFrame: false,
        hasShadow: false,
        backgroundColor: '#00000000',
        resizable: true,
        minWidth: 800,
        minHeight: 500,
        skipTaskbar: false,
        focusable: true,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    
    windows.settings.loadFile('./dist/settings.html')

    ewc.setAcrylic(windows.settings, 0x16161699)

    // Open external links in a browser instead of the electron app
    windows.main.webContents.on('new-window', function (e, url) {
        e.preventDefault()
        shell.openExternal(url)
    });

    windows.settings.webContents.on('new-window', function (e, url) {
        e.preventDefault()
        shell.openExternal(url)
    });

    windows.main.on('ready-to-show', function(){
        windows.main.show()
        if (windows.splash) {
            windows.splash.destroy()
            windows.splash = null    
        }
    })

    windows.settings.on('ready-to-show', function(){
        logger.log("Settings ready.")
    })

    windows.settings.on('close', (e)=>{
        e.preventDefault()
        windows.settings.hide()
    })
     
    
    if (app.isPackaged) { windows.main.setMenuBarVisibility(false) }
}