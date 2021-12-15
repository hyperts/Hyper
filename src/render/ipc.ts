import { ipcRenderer } from "electron"


export function openSettings() {
    ipcRenderer.send('openSettings')
}

export function openContext() {
    ipcRenderer.send("show-context-menu")
}

export function refresh() {
    ipcRenderer.send('refreshApp')
}

export function openExtensions() {
    ipcRenderer.send('openExtensions', true)
}