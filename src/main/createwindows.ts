import { app, BrowserWindow, shell } from "electron";
import { Config } from '../shared/config';
import { stringToHex, generateBounds, removeAppBar } from '../../utils';
import ewc from 'ewc';


import { Logger } from "../shared/logger";
const logger = new Logger('WINDOW MANAGER')

export async function createWindows( windows: {[key: string]:BrowserWindow|null } ) {

    const configBehavior = new Config("general.items.behavior.fields") 
    const configComposition = new Config("appearence.items.composition.fields")
    const mainBounds = generateBounds()

    windows.main = new BrowserWindow({
        width: mainBounds.width, 
        height: mainBounds.height, 
        frame: false,
        x: mainBounds.x,
        y: mainBounds.y,
        minimizable: false,
        alwaysOnTop: configBehavior.get("always-on-top.value"),
        thickFrame: false,
        backgroundColor: '#00000000',
        hasShadow: false,
        resizable: false,
        skipTaskbar: true,
        focusable: true,
        fullscreenable: false,
        show: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    windows.main.loadFile('./dist/index.html')
   
    setInterval(()=>{
        const currentPos = windows?.main?.getPosition()
        if (currentPos && currentPos[0] != mainBounds.x || currentPos && currentPos[1] != mainBounds.y) {
            windows.main?.setPosition(mainBounds.x, mainBounds.y)
        }
    }, 5000)

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
        // if (windows.main) {
        //     windows.main.show()
        // }

        if (windows.splash) {
            windows.splash.close() 
            windows.splash = null  
        }

        logger.debug("Hyper loaded")
        if (new Config().getValue('general','misc', "console-window")) {
            windows.main?.webContents.openDevTools({
                mode: 'detach'
            })
        }
    })

    
    windows.main.on('close', (e)=>{
        removeAppBar()
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
            logger.info('Settings window registered & Ready to show')
        })
        
        windows.settings.on('close', (e)=>{
          delete windows.settings
        })
    } else {
        windows?.settings.show()
    }
}

export function createExtensionWindow(windows: {[key:string]:BrowserWindow|null}, firstTime: boolean) {
    if (!windows.extension) {
        windows.extension = new BrowserWindow({
            width: 900,
            height: 600,
            show: true, 
            frame: false,
            minimizable: true,
            thickFrame: false,
            hasShadow: false,
            backgroundColor: '#00000000',
            minWidth: 800,
            minHeight: 500,
            skipTaskbar: false,
            focusable: true,
            fullscreenable: true,
            maximizable: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        })
    } else {
        windows?.extension.show()
    }

    windows.extension.on('close', (e)=>{
        delete windows.extension
      })

    windows.extension.on('ready-to-show', function(){
        if (!firstTime) {
            windows.extension?.webContents.send('extensionWindowHideTutorial')
        }
    })
    
    windows.extension.loadFile('./dist/extension.html')

    windows.extension.on('ready-to-show', function(){
        logger.info('Extension window registered & Ready to show')
    })
}

export function createDebugWindow(windows: {[key:string]:BrowserWindow|null}) {
    if (!windows.console) {
        windows.console = new BrowserWindow({
            width: 1200,
            height: 600,
            show: true, 
            frame: true,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        })
    } else {
        windows?.console.show()
    }

    windows.console.on('close', (e)=>{
        delete windows.console
      })
    
    windows.console.loadFile('./dist/console.html')

    windows.console.on('ready-to-show', function(){
        logger.info('Console / Debugger window ready to show')
    })
}