import {app, ipcMain, screen} from 'electron';
import ewc from 'ewc'

function startIPC(windows) {
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit()
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
}

export default startIPC;