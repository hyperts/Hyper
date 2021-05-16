import { join } from 'path';
import { homedir } from 'os';
import { readdirSync, existsSync, readFileSync } from 'fs';
class WidgetRepository {
    public loadedWidgets: [widget?: object];

    constructor() {
        this.loadedWidgets = [];
    }

    getWidgetContext() {
        // Inject specific winapi + hyper api methods to default context on widget
    }

    requireWidget(widgetInfo: {main: string, renderer: string, version: string, name: string}) {
        try {
            const widgetObject = require(widgetInfo.main);
    
            if (widgetObject.default) {
                widgetObject.default(this.getWidgetContext());
            }
    
            this.loadedWidgets.push(widgetInfo);
        } catch (err) {
            console.error("Error loading widget " + widgetInfo.main + " :: " + err);
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
            renderer: `widgets://${widgetInfo.name}/${widgetInfo.renderer}`,
            main: join(widgetPath, widgetInfo.main),
        })
        
        this.requireWidget(widgetInfo);
    }

    loadWidgetsInPaths() {
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