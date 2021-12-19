import { app, protocol, dialog } from 'electron';
import path, { dirname } from 'path';
import WidgetRepository, { WidgetObject } from './shared/widget';
import { Config } from './shared/config'
import { homedir } from 'os';
import { createWindows, createSplash, createDebugWindow } from './main/createwindows';
import startIPC from './main/ipc';

import './main/checkdir';

// import log from 'electron-log'
// import {join} from 'path'
import ThemeRepository from './shared/theme';
import {makeAppBar} from '../utils'
import { Logger } from './shared/logger';

// const logger = log.scope('WIDGET')
// const logg = log.scope('MAIN')
// log.transports.file.resolvePath = () => join(homedir(), '.hyperlogs/main.log');
export const windows = {}
let loadedWidgets: WidgetObject[] = []
export const widgetReference: {[key: string]: WidgetObject} = {}


if (!app.isPackaged) require('electron-reload')(__dirname, {
    electron: process.platform === 'win32'
        ? path.join(dirname(__dirname), "node_modules", "electron", "dist", "electron.exe")
        : path.join(dirname(__dirname), 'node_modules', '.bin', 'electron')
})

const gotTheLock = app.requestSingleInstanceLock()


if (!gotTheLock) {
  dialog.showErrorBox('Failed to initialize Hyper', `Hyper attempted to kill other instances of itself and failed\n - Probably:\n -- Another instance of hyper is open, try and close it via a task manager.\n -- A Widget is trying to control hyper initializing process, remove your latest installed widget\n -- Hyper developers are insane, contact them.\n\n -- Restarting hyper may resolve your problem`)
  app.quit()
}



const logg = new Logger('MAIN')

const loggWidget = new Logger('[MAIN] WIDGET')

dialog.showErrorBox = (title, err) =>{
    logg.error(`Not managed exception in: ${title}\n      Error information:\n       ${err}`)
}

app.on('ready', async ()=>{
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
        if (!loadedWidgets) {
            loggWidget.error(`Invalid attempt to access widget protocol\n - url:${url}\n - Widget not loaded`)
            return
        }
        const searchRegExp = /\\/gi;
        const replaceWith = '/';

        const probableName = url.replace(searchRegExp, replaceWith).split('/')[0]
        const entryMatch = widgetReference?.[probableName]

        if (!entryMatch) {
            loggWidget.error(`Invalid attempt to access widget protocol\n - url:${url}\n - Widget not found in reference`)
            return
        }

        const newURL = url.replace(probableName, entryMatch.directory)
        callback({ path: path.normalize(`${homedir()}/.hyperbar/widgets/${newURL}`) })
    })    
    
    if (process.defaultApp) {
        if (process.argv.length >= 3) {
            app.setAsDefaultProtocolClient('hyper-install', process.execPath, [path.resolve(process.argv[1], process.argv[2])])
        }

    } else {
        app.setAsDefaultProtocolClient('hyper-install')
    }

    createSplash(windows) // Loading the splashscreen before doing Sync procedures

    if (new Config().getValue('general','misc', "console-window")) {
        createDebugWindow(windows)
    }

    const widgetRepository = new WidgetRepository();
    widgetRepository.loadWidgetsInPaths()

    const themeRepository = new ThemeRepository();
    themeRepository.setVars()

    // Giving 2 seconds for any hanging rule in main.
    setTimeout(async () => { 
        await makeAppBar()
        createWindows(windows) // Creates main app windows [Main, Settings]
        startIPC(windows) 
        loadedWidgets = widgetRepository.loadedWidgets
        widgetRepository.loadedWidgets.forEach( widget =>{
            widgetReference[widget.name] = widget
            widget.default()
            loggWidget.debug(`Extension/Widget loaded: ${widget?.name} v${widget?.version} by:${widget.author}`)
        })
        widgetRepository.watchWidgets()
    }, 2000);

})