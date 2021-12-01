import { app, BrowserWindow, shell } from "electron";
import { Config } from '../shared/config';
import { stringToHex, generateBounds } from './utils';
import ewc from 'ewc';

import log from 'electron-log'
import {homedir} from 'os'
import {join} from 'path'
const logger = log.scope('WINDOW')
log.transports.file.resolvePath = () => join(homedir(), '.hyperbar/logs/main.log');


export function createWindows( windows: {[key: string]:BrowserWindow|null } ) {
  
    const configBehaviour = new Config("general.items.behaviour.fields") 
    const configComposition = new Config("appearence.items.composition.fields")
    const mainBounds = generateBounds()

    windows.main = new BrowserWindow({
        width: mainBounds.width, 
        height: mainBounds.height, 
        frame: false,
        x: mainBounds.x,
        y: mainBounds.y,
        minimizable: false,
        alwaysOnTop: configBehaviour.get("always-on-top.value"),
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
   

    switch (configComposition.get("effect.value")) {
        case "acrylic":
            ewc.setAcrylic(windows.main, stringToHex( configComposition.get("tint.value")))
            break;
        case "blur":
            ewc.setBlurBehind(windows.main, stringToHex(configComposition.get("tint.value")))
            break;
        case "transparent":
            ewc.setTransparentGradient(windows.main, 0x0000000)
            break;
        default:
            windows.main.setBackgroundColor( configComposition.get("tint.value") )
    }

    windows.main.webContents.on('new-window', function (e, url) {
        e.preventDefault()
        shell.openExternal(url)
    });

    windows.main.on('ready-to-show', function(){
        if (windows.main) {
            windows.main.show()
        }

        if (windows.splash) {
            windows.splash.close() 
            windows.splash = null  
        }

        logger.debug("Hyper loaded")
        windows.main?.webContents.openDevTools({
            mode: 'detach'
        })
    })

    
    windows.main.on('close', (e)=>{
        e.preventDefault();
        app.quit();
        process.exit(0);
    })     
    
    if (app.isPackaged) { windows.main.setMenuBarVisibility(false) }
}

export function createSplash(windows: {[key: string]:BrowserWindow}) {
    logger.debug("Creating load screen window")

    windows.splash = new BrowserWindow({
        width: 600, 
        height: 300, 
        minimizable: false,
        alwaysOnTop: true,
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

export function createSettingsWindow(windows: {[key: string]:BrowserWindow|null }) {
    if (!windows.settings) {
        windows.settings = new BrowserWindow({
            width: 900, 
            height: 600, 
            show: true, 
            frame: false,
            minimizable: true,
            thickFrame: false,
            hasShadow: false,
            backgroundColor: '#00000000',
            resizable: false,
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
        
        
        windows.settings.webContents.on('new-window', function (e, url) {
            e.preventDefault()
            shell.openExternal(url)
        });
        
        windows.settings.loadFile('./dist/settings.html')
        ewc.setAcrylic(windows.settings, 0x21212120)
    
        windows.settings.on('ready-to-show', function(){
            console.debug("Created Settings window")
        })
        
        windows.settings.on('close', (e)=>{
          delete windows.settings
        })
    }
}
