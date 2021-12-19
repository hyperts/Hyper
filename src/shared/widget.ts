import { join } from 'path';
import { homedir } from 'os';
import { readdirSync, existsSync, readFileSync, lstatSync, unlinkSync, rmdirSync } from 'fs';
import { Config } from './config';
import chokidar from 'chokidar'
import Zip from 'adm-zip';
// import log from 'electron-log'
import { ipcRenderer } from 'electron';
import { Logger } from './logger';

const logger = new Logger('WIDGET CONTROLLER')
// log.transports.file.resolvePath = () => join(homedir(), '.hyperlogs/main.log');

function rimraf(dir_path: string) {
    if (existsSync(dir_path)) {
        readdirSync(dir_path).forEach(function(entry) {
            var entry_path = join(dir_path, entry);
            if (lstatSync(entry_path).isDirectory()) {
                rimraf(entry_path);
            } else {
                unlinkSync(entry_path);
            }
        });
        rmdirSync(dir_path);
    }
}

export type WidgetInfo = {
    image?: string, 
    name:string, 
    author?:string, 
    description:string, 
    main?: string, 
    renderer?: string, 
    version: string, 
    widgetPath?: string, 
    repository?: string
    directory: string
    file: string
}
export interface WidgetObject extends WidgetInfo {
    default: () => void;
    styles?: string[];
}
class WidgetRepository {
    public loadedWidgets: WidgetObject[];
    private isRenderer: boolean;

    constructor() {
        this.loadedWidgets = [];
        this.isRenderer = false
    }

    getWidgetContext(widgetInfo: WidgetInfo) {
        if (!this.isRenderer) {
            const electron = require('electron')
            const directory = widgetInfo.file.split('\\widgets\\')
           
            return {
                config:  new Config(),
                api: {
                    show: electron.app.show,
                    ipcMain:  electron.ipcMain,
                    browserWindow: electron.BrowserWindow,
                    Menu: electron.Menu,
                    shell: electron.shell,
                    windows: require('../main').windows,
                    directory: directory[directory.length -1].split('\\')[0],
                },
                logger: new Logger(`[MAIN] ${widgetInfo.name}`)
            }
        } else {
            const electron = require('electron')

            return {
                config: new Config(),
                api: {
                    ipcRenderer: electron.ipcRenderer,
                },
                logger: new Logger(`[RENDER] ${widgetInfo.name}`)
            }

        }
    }

    requireWidget(widgetInfo: WidgetObject) {
        try {
            const widgetExecutor = require(widgetInfo.file) as WidgetObject;
            const directory = widgetInfo.file.split('\\widgets\\')
            
            widgetInfo.default = widgetExecutor.default.bind( this.getWidgetContext(widgetInfo),  )
            widgetInfo.directory = directory[directory.length -1].split('\\')[0]
            widgetInfo.styles = widgetExecutor.styles
            this.loadedWidgets.push(widgetInfo);
        } catch (err) {
            logger.error(`Failed loading [${widgetInfo.file}] - ${err}`);
        }
    }

    loadWidget(widget: string, path: string) {
        const widgetPath = join(path, widget);
        const widgetPathPackageJson = join(widgetPath, 'package.json');

        if (!existsSync(widgetPath)) {
            logger.warn(`Path [${widgetPath}] is invalid`);
            return;
        }

        if (!existsSync(widgetPathPackageJson)) {
            logger.warn(`Failed to load [${widgetPath}]\n > ${widgetPathPackageJson} does not exist`);
            return;
        }

        const stats = lstatSync(path)

        if (stats && !stats.isDirectory()) {
            logger.warn(`Detected invalid file in widgets path.\n - You forgot to extract the widget?\n - Widget files must be on their own folder, not directly on widgets directory.\n - This file will not be loaded.`)
        }

        let widgetInfo = JSON.parse( readFileSync(widgetPathPackageJson).toString() );
            
        widgetInfo = Object.assign(widgetInfo, {
            widgetPath,
            file: join(widgetPath, this.isRenderer ? widgetInfo.renderer : widgetInfo.main)
        })

        if (widgetInfo.hypersettings && widgetInfo.hypersettings.fields && Object.keys(widgetInfo.hypersettings.fields).length > 0) {
            const config = new Config()
            if (!config.get('widgets')) {
                config.insert('widgets', {
                    name: "Widgets",
                    items: {}
                })
            }
            
            if (!config.getEntry('widgets', widgetInfo.hypersettings.name)) {
                config.addEntry('widgets', {
                    name: widgetInfo.hypersettings.name,
                    description: widgetInfo.hypersettings.description,
                    icon: widgetInfo.hypersettings.icon,
                    fields: widgetInfo.hypersettings.fields
                })

                config.save()
            }            
        }
        
        this.requireWidget(widgetInfo);
    }


    loadWidgetsInPaths() {
        this.isRenderer = process && process.type === 'renderer'
        // TODO: Detect first run
        // TODO: Load default widgets from hyper repository
        
        this.widgetPaths.forEach(path => {
            const widgets = readdirSync(path);
    
            widgets.forEach(widget => {
                this.loadWidget(widget, path);
            })
        });
    }

    get widgetPaths() {
        const paths = [
            join(homedir(), "./.hyperbar/widgets"),
        ];

        return paths;
    }

    installWidget(path: string, callback?: (installedWidget: WidgetInfo) => void ) {
        if (!existsSync(path)) { logger.error(`Tried to install invalid widget file - Corrupted or missing :: ${path}`); return false; }
        if (!path.endsWith('.zip')) { logger.error(`This file is not a compressed folder - Skipping :: ${path}`); return false; }

        const zipFile = new Zip(path)
        let widgetData: string = ""

        if (zipFile.getEntries().length <= 0) { logger.error(`Empty or corrupt zip file :: ${path}`); return false; }

        zipFile.getEntries().forEach(function (zipEntry: any) { // TODO: Declaration files for adm-zip
            if (zipEntry.entryName.endsWith("package.json")) {
                widgetData = zipFile.readAsText(zipEntry)
            }
        });

        if (widgetData === "") { logger.error(`Tried to install non widget zip :: ${path}`); return false; }

        zipFile.extractAllTo(this.widgetPaths[0], true)
        
        logger.debug(`Installed widget - ${JSON.parse(widgetData).name}`)

        if (this.isRenderer) {
            this.loadWidgetsInPaths()
            this.watchWidgets()
            this.loadStyles()
            ipcRenderer.send('forceReload')
        } else {
            this.loadWidgetsInPaths()
            this.watchWidgets()
            this.loadedWidgets.forEach( widget =>{
                widget.default()
            })
        }

        callback?.(JSON.parse(widgetData))
        
        return JSON.parse(widgetData)
    }

    uninstallWidget(widget: WidgetObject, callback?: () => void) {
        const directory = widget.file.split('\\widgets\\')
        const widgetPath = join(homedir(), '.hyperbar', 'widgets', directory[directory.length -1].split('\\')[0])
        const widgetPathPackageJson = join(widgetPath, 'package.json');
        if (!existsSync(widgetPath)) {
            logger.error(`Path [${widgetPath}] is invalid`);
            return;
        }

        if (!existsSync(widgetPathPackageJson)) {
            logger.error(`Failed to remove [${widgetPath}]\n > ${widgetPathPackageJson} does not exist`);
            return;
        }

        const stats = lstatSync(widgetPath)

        if (stats && !stats.isDirectory()) {
            logger.warn(`Detected invalid file in widgets path.\n - You forgot to extract the widget?\n - Widget files must be on their own folder, not directly on widgets directory.\n - This file will not be loaded.`)
        }

        let widgetInfo = JSON.parse( readFileSync(widgetPathPackageJson).toString() );
            
        const config = new Config()
        
        const entryName = widgetInfo.hypersettings.name.toLowerCase().split(' ').join('_')

        if (config.getEntry('widgets', entryName)) {
            delete config.data.widgets.items[entryName]
            if (config.data.widgets.items.length <= 0) {
                delete config.data.widgets
            }
            config.save()
        }
        
        rimraf(widgetPath)
        callback?.()
    }

    watchWidgets() {
        const config = new Config()
        const watchWidgets = config.getValue('general', 'misc', 'watch-widgets')
        if (!watchWidgets) { return }
        
        const watchList: string[] = []
        this.loadedWidgets.forEach( widget => {
            watchList.push(widget.file)
            if (widget.styles) {
                widget.styles.forEach( style =>{
                    logger.success(`Watching style: ${widget.name}/${style}`)
                    watchList.push(`${join(homedir(), "./.hyperbar/widgets", widget.name, style)}`)
                })
            }
        })

        const watcher = chokidar.watch(watchList)
        logger.info("Total widget entries being watched:", watchList.length )
        
        const electron = require('electron');

        watcher.on('change', () =>{

            if(this.isRenderer) {
                electron.ipcRenderer.send('forceReload')
            } else {
                electron.app.relaunch()
                electron.app.exit()
            }
        })
    }

    loadStyles() {
        this.loadedWidgets.map( widget =>{
            widget.styles?.forEach( style => {
                const head = document.querySelector('head')
                if (head) { head.innerHTML += `<link rel="stylesheet" href="widgets://${widget.name}/${style}" type="text/css"/>`; }
            })
        })
    }
}

export default WidgetRepository