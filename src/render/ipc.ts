import { ipcRenderer } from "electron"


export function openSettings() {
    ipcRenderer.send('openSettings')
}

export function refresh() {
    ipcRenderer.send('refreshApp')
}
