import { join } from 'path';
import { homedir } from 'os';
import { readdirSync, existsSync, readFileSync } from 'fs';
import { Config } from './config';

import log from 'electron-log'
const logger = log.scope('WIDGET')
log.transports.file.resolvePath = () => join(homedir(), '.hyperbar/logs/main.log');
class WidgetRepository {
    public loadedWidgets: [widget?: {name:string, main?: string, renderer?: string, version: string, widgetPath?: string, file?: string, run?: any}];
    private isRenderer: boolean;

    constructor() {
        this.loadedWidgets = [];
        this.isRenderer = false
    }

    getWidgetContext() {
        if (!this.isRenderer) {
            const electron = require('electron')
            return {
                config:  new Config(),
                Menu: electron.Menu,
                api: {
                    quit: electron.app.quit,
                    relaunch: electron.app.relaunch,
                    show: electron.app.show,
                    ipcMain:  electron.ipcMain,
                    browserWindow: electron.BrowserWindow,
                    windows: require('../main').windows
                }
            }
        } else {
            const electron = require('electron')

            return {
                config: new Config(),
                api: {
                    ipcRenderer: electron.ipcRenderer,
                    icons: require('feather-icons')
                },
                body: document.getElementById('hyperbar')
            }

        }
    }

    requireWidget(widgetInfo: {file: string, version: string, name: string}) {
        try {
            const widgetObject = require(widgetInfo.file);
            this.loadedWidgets.push(widgetInfo);

            widgetObject.default(this.getWidgetContext())
            
        } catch (err) {
            logger.error(`Failed loading [${widgetInfo.file}]`);
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

    loadWidgetsInPaths(isRenderer?: boolean) {
        this.isRenderer = isRenderer ?? false
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


}

export default WidgetRepository