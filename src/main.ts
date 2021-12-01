import { app, protocol } from 'electron';
import path, { dirname } from 'path';
import WidgetRepository from './shared/widget';
import { homedir } from 'os';
import { createWindows } from './main/createwindows';
import startIPC from './main/ipc';
import { createSplash } from './main/createwindows';

import './main/checkdir';

import log from 'electron-log'
import {join} from 'path'
const logger = log.scope('WIDGET')
log.transports.file.resolvePath = () => join(homedir(), '.hyperbar/logs/main.log');

export const windows = {}


if (!app.isPackaged) require('electron-reload')(__dirname, {
    electron: process.platform === 'win32'
        ? path.join(dirname(__dirname), "node_modules", "electron", "dist", "electron.exe")
        : path.join(dirname(__dirname), 'node_modules', '.bin', 'electron')
})

app.on('ready', ()=>{
    protocol.registerFileProtocol('assets', (request, callback) => {
        const url = request.url.substr(9)
        callback({ path: path.normalize(`${__dirname}/assets/${url}`) })
    })   
    
    protocol.registerFileProtocol('theme', (request, callback) => {
        const url = request.url.substr(7)
        callback({ path: path.normalize(`${homedir()}/.hyperbar/themes/${url}`) })
    })    

    protocol.registerFileProtocol('widgets', (request, callback) => {
        const url = request.url.substr(10)
        console.log("Protocol widget, url:", path.normalize(`${homedir()}/.hyperbar/widgets/${url}`))
        callback({ path: path.normalize(`${homedir()}/.hyperbar/widgets/${url}`) })
    })    

    createSplash(windows) // Loading the splashscreen before doing Sync procedures

    
    // We give widgets 2 seconds before showing the main window, this helps with image loading :D
    // creators of weather and music widgets will appreciate this.
    
    const widgetRepository = new WidgetRepository();
    widgetRepository.loadWidgetsInPaths()
    widgetRepository.loadedWidgets.forEach( widget => {
        logger.debug(`Loaded: ${widget?.name}
        --> Version: ${widget?.version}
        --> Author: ${widget?.author ?? 'Unknown'}
        --> Main? ${widget.main}
        --> Renderer? ${widget.renderer}`)
    })

    setTimeout(() => { 
        createWindows(windows) // Creates main app windows [Main, Settings]
        startIPC(windows) 
        widgetRepository.loadedWidgets.forEach( widget =>{
            widget.default()
        })
        widgetRepository.watchWidgets()
    }, 2000);
    
})