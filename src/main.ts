import { app, protocol, dialog } from 'electron';
import path, { dirname } from 'path';
import WidgetRepository from './shared/widget';
import { Config } from './shared/config'
import { homedir } from 'os';
import { createWindows, createSplash } from './main/createwindows';
import startIPC from './main/ipc';

import './main/checkdir';

import log from 'electron-log'
import {join} from 'path'
import ThemeRepository from './shared/theme';
import {makeAppBar} from './main/utils'

const logger = log.scope('WIDGET')
const mainLogger = log.scope('MAIN')
log.transports.file.resolvePath = () => join(homedir(), '.hyperbar/logs/main.log');

export const windows = {}


if (!app.isPackaged) require('electron-reload')(__dirname, {
    electron: process.platform === 'win32'
        ? path.join(dirname(__dirname), "node_modules", "electron", "dist", "electron.exe")
        : path.join(dirname(__dirname), 'node_modules', '.bin', 'electron')
})

dialog.showErrorBox = (title, err) =>{
    mainLogger.error(`Not managed exception in: ${title}\n      Error information:\n       ${err}`)
}

app.on('ready', async ()=>{
    await makeAppBar()

    protocol.registerFileProtocol('assets', (request, callback) => {
        const url = request.url.substr(9)
        callback({ path: path.normalize(`${__dirname}/assets/${url}`) })
    })   
    
    protocol.registerFileProtocol('theme', (request, callback) => {
        const url = request.url.substr(7)
        const themeConfig = new Config('appearence.items.theme.fields.selected')
        callback({ path: path.normalize(`${homedir()}/.hyperbar/themes/${themeConfig.get('value')}${url}`) })
    })    

    protocol.registerFileProtocol('widgets', (request, callback) => {
        const url = request.url.substr(10)
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
    const themeRepository = new ThemeRepository();
    themeRepository.setVars()

    setTimeout(() => { 
        createWindows(windows) // Creates main app windows [Main, Settings]
        startIPC(windows) 
        widgetRepository.loadedWidgets.forEach( widget =>{
            widget.default()
        })
        widgetRepository.watchWidgets()
    }, 2000);
    
})