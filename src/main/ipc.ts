import {app, BrowserWindow, ipcMain, screen} from 'electron';
import ewc from 'ewc'

function startIPC(windows: {[key: string]: BrowserWindow}) {
    app.on('window-all-closed', () => {
       app.quit()
    })
    
    ipcMain.on('openSettings', () => {
        windows.settings.show();
        ewc.setAcrylic(windows.settings, 0x0000000)
    })
    
    ipcMain.on('updateComposition', (_, composition) => {
    
    })
    
    ipcMain.on('windowMoving', (e, {mouseX, mouseY}) => {
        const { x, y } = screen.getCursorScreenPoint()
        windows.settings.setPosition(x - mouseX, y - mouseY)
    });
    
    ipcMain.on('windowMoved', () => {
    
    })

    ipcMain.on('refreshApp', () => {
        app.relaunch()
        app.exit()
    })
}

export default startIPC;