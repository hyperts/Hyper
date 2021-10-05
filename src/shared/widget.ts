import { join } from 'path';
import { homedir } from 'os';
import { readdirSync, existsSync, readFileSync } from 'fs';
import { Config } from '../shared/config';

class WidgetRepository {
    public loadedWidgets: [widget?: {name:string, main?: string, renderer?: string, version: string, widgetPath?: string, file?: string, run?: any}];
    private isRenderer: boolean;

    constructor() {
        this.loadedWidgets = [];
        this.isRenderer = false
    }

    getWidgetContext() {
        if (!this.isRenderer) {
            return {
                config:  new Config()
            }
        }
    }

    requireWidget(widgetInfo: {file: string, version: string, name: string, run?: any}) {
        try {
            const widgetObject = require(widgetInfo.file);
    
            if (widgetObject.default) {
                widgetObject.default.bind(this.getWidgetContext());
                widgetInfo.run = widgetObject.default
            }

            this.loadedWidgets.push(widgetInfo);
            
            if (!this.isRenderer) {
                widgetObject.default(this.getWidgetContext())
            }
        } catch (err) {
            console.error("Error loading widget " + widgetInfo.file + " :: " + err);
        }
    }

    loadWidget(widget: string, path: string) {
        const widgetPath = join(path, widget);
        const widgetPathPackageJson = join(widgetPath, 'package.json');

        if (!existsSync(widgetPath)) {
            console.warn(`Widget directory ${widgetPath} does not exist`);
            return;
        }

        if (!existsSync(widgetPathPackageJson)) {
            console.warn(`Widget package json ${widgetPathPackageJson} does not exist`);
            return;
        }

        let widgetInfo = JSON.parse( readFileSync(widgetPathPackageJson).toString() );
        widgetInfo = Object.assign(widgetInfo, {
            widgetPath,
            file: join(widgetPath, this.isRenderer ? widgetInfo.renderer : widgetInfo.main)
        })
        
        this.requireWidget(widgetInfo);
    }

    loadWidgetsInPaths(isRenderer?: boolean) {
        this.isRenderer = isRenderer ?? false
        // TODO: Load default widgets from hyper repository
        console.log("Loading default widgets")

        console.log("Loading widgets from hyper directory")
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