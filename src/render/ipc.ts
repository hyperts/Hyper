import { ipcRenderer } from "electron";

export function openSettings() {
    ipcRenderer.send('openSettings')
}

export function refresh() {
    ipcRenderer.send('refreshApp')
}

ipcRenderer.on('asynchronous-reply', (_, arg) => {
    console.log('asynchronous-reply', arg) // prints "pong"
})
