import { app, protocol } from 'electron';
import path, { dirname } from 'path';
import WidgetRepository from './shared/widget';
import { homedir } from 'os';
import { createWindows } from './main/createwindows';
import startIPC from './main/ipc';
import { createSplash } from './main/createwindows';

import './main/checkdir';

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
        callback({ path: path.normalize(`${homedir()}/.hyperbar/themes${url}`) })
    })    

    createSplash(windows) // Loading the splashscreen before doing Sync procedures

    const widgets = new WidgetRepository();
    widgets.loadWidgetsInPaths()

    widgets.loadedWidgets.forEach( widget => {
        console.log(`[WIDGET] Loaded: ${widget?.name} -> Version: ${widget?.version}`)
    })
    
    // We give widgets 2 seconds before showing the main window, this helps with image loading :D
    // creators of weather and music widgets will appreciate this.
    setTimeout(() => { 
        createWindows(windows) // Creates main app windows [Main, Settings]
        startIPC(windows) 
    }, 2000);
    
})


var net = require('net');

var PIPE_NAME = "hyper";
var PIPE_PATH = "\\\\.\\pipe\\" + PIPE_NAME;

var server = net.createServer(function(stream: any) {
    console.log('Server :: Connection')

    stream.on('data', function(c: any) {
        console.log('Server :: data:', c.toString());
    });

    stream.on('end', function() {
        console.log('Server :: ended')
        server.close();
    });

    stream.write(':: soft ::');
});

server.on('close',function(){
    console.log('Server :: closed');
})

server.listen(PIPE_PATH,function(){
    console.log('Server :: listening');
})




var client = net.connect(PIPE_PATH, function() {
    console.log('Client :: connected');
})

client.on('data', function(data: any) {
    console.log('Client: data:', data.toString());
    client.end('OK');
});

client.on('end', function() {
    console.log('Client :: ended');
})