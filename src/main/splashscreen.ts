import { BrowserWindow } from 'electron';
import ewc from 'ewc';
import logger from 'electron-timber'


export function createSplash(windows) {
    logger.log("Starting splash screen")

    windows.splash = new BrowserWindow({
        width: 600, 
        height: 300, 
        minimizable: false,
        alwaysOnTop: false,
        thickFrame: false,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        hasShadow: false,
        resizable: false,
        skipTaskbar: false,
        focusable: true,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    ewc.setTransparentGradient(windows.splash, 0x0000000)
    windows.splash.loadFile('./dist/loading.html')

}
