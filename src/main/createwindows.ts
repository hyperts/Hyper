import { app, BrowserWindow, shell } from "electron";
import { Config } from '../shared/config';
import { stringToHex, generateBounds } from './utils';
import ewc from 'ewc';


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
    ewc.setAcrylic(windows.settings, 0x21212120)

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

    windows.settings.webContents.on('new-window', function (e, url) {
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

        console.log("Hyper loaded, showing main window")
    })

    
    windows.main.on('close', (e)=>{
        e.preventDefault();
        app.quit();
        process.exit(0);
    })


    windows.settings.on('ready-to-show', function(){
        console.log("Settings ready.")
    })

    windows.settings.on('close', (e)=>{
        e.preventDefault()
        
        if (windows.settings) {
            windows.settings.hide()
        }
    })
     
    
    if (app.isPackaged) { windows.main.setMenuBarVisibility(false) }
}
