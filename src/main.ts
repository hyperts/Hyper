import { app, protocol } from 'electron';
import path, { dirname } from 'path';
import WidgetRepository from './shared/widget';
import { createWindows } from './main/createwindows';
import startIPC from './main/ipc';
import { createSplash } from './main/splashscreen';

import './main/checkdir';

let windows = {}


if (!app.isPackaged) require('electron-reload')(__dirname, {
    electron: process.platform === 'win32'
        ? path.join(dirname(__dirname), "node_modules", "electron", "dist", "electron.exe")
        : path.join(dirname(__dirname), 'node_modules', '.bin', 'electron')
})

app.on('ready', ()=>{
    protocol.registerFileProtocol('assets', (request, callback) => {
        const url = request.url.substr(9)
        console.log("Trying to access assets protoctol", url, path.normalize(`${__dirname}/assets/${url}`))
        callback({ path: path.normalize(`${__dirname}/assets/${url}`) })
    })   
    
    protocol.registerFileProtocol('theme', (request, callback) => {
        const url = request.url.substr(7)
        callback({ path: path.normalize(`${__dirname}/assets/${url}`) })
    })    
    
    createSplash(windows) // Loading the splashscreen before doing Sync procedures

    const widgets = new WidgetRepository();
    widgets.loadWidgetsInPaths()

    console.log("Loaded Widgets:", widgets.loadedWidgets)
    
    // We give widgets 2 seconds before showing the main window, this helps with image loading :D
    // creators of weather and music widgets will appreciate this.
    setTimeout(() => { 
        createWindows(windows) // Creates main app windows [Main, Settings]
        startIPC(windows) 
    }, 2000);
    
})
