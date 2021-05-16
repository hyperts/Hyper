import { ipcRenderer } from "electron";

/** Send and receive messages from the main process.
 * @see https://www.electronjs.org/docs/api/ipc-main
 */

export function sendPingSync() {
    const response = ipcRenderer.sendSync('synchronous-message', 'ping') // returns "pong"
    console.log('synchronous-message', response)
}

export function sendPingAsync() {
    ipcRenderer.send('asynchronous-message', 'ping')
}

export function openSettings() {
    ipcRenderer.send('openSettings')
}

ipcRenderer.on('asynchronous-reply', (_, arg) => {
    console.log('asynchronous-reply', arg) // prints "pong"
})