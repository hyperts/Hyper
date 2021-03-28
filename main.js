global.appRoot = require('path').resolve(require('path').join(__dirname))

const { app, BrowserWindow, screen, ipcMain, protocol } = require('electron')
const Logger = require('@ptkdev/logger')
const path = require('path')
const { Theme } = require('./core/loader.js')
const Config = require('./core/config.js')

const config = new Config() // If we don't give any argument to config constructor, it will return the one from main folder!

const theme = new Theme(config.get('general.look-and-feel.theme'))

// getThemeList()
//   .then(list => {
//     console.log(list)
//   })
//   .catch(err => {
//     console.log('Error on async', err)
//   })
// const logger = new Logger()

const { calculateMargins, commitUserFolder, createDirOnUserFolder, getPathOnUserFolder, ensureDefaultTheme } = require('./core/utils.js')

// TODO: Change from EWC to GLASSTRON because it's just better...
const ewc = require('ewc')

const win = {}

commitUserFolder()
createDirOnUserFolder('logs')
createDirOnUserFolder('themes')

const logPath = getPathOnUserFolder('logs')
const options = {
  language: 'en', // set language of log type, NOTE: please help with translations! (optional, default en - values: en|it|pl|es|pt|de|ru)
  colors: true, // enable/disable colors in terminal (optional, default enabled - values: true|enabled or false|disabled)
  write: true,
  path: { // remember: add string *.log to .gitignore
    debug_log: `${logPath}\\cl_debug.log`,
    error_log: `${logPath}\\cl_errors.log`
  }
}
const logger = new Logger(options)

logger.info(logPath, 'UserPath')

require('@electron/remote/main').initialize()

protocol.registerSchemesAsPrivileged([
  { scheme: 'theme', privileges: { bypassCSP: true } },
  { scheme: 'core', privileges: { bypassCSP: true } }
])

app.whenReady().then(async () => {
  logger.debug('Ready', 'APP Event')

  protocol.registerFileProtocol('theme', (request, callback) => {
    logger.debug(`Acessing protocol theme://->${getPathOnUserFolder('')}`, 'APP Event')
    const url = request.url.substr(7)
    callback({ path: path.normalize(`${getPathOnUserFolder('')}//themes//${config.get('general.look-and-feel.theme')}//${url}`) })
  })

  protocol.registerFileProtocol('core', (request, callback) => {
    const url = request.url.substr(7)
    logger.debug(`Acessing protocol core://->${__dirname}${url}`, 'APP Event')

    callback({ path: path.normalize(`${__dirname}/${url}`) })
  })

  await ensureDefaultTheme()

  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const { w, h, x, y } = calculateMargins(width, height)

  win.barWindow = new BrowserWindow({
    width: w,
    height: h,
    x,
    y,
    frame: config.get('general.advanced.show-frame'),
    alwaysOnTop: config.get('general.behaviour.always-on-top'),
    // show: config.general.advanced['show-before-load'],
    perload: `${appRoot}\\core\\index.js`,
    minimizable: false,
    thickFrame: false,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    focusable: true,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      devTools: config.get('general.advanced.debug-mode'),
      contextIsolation: false
    }
  })

  theme.initialize(win.barWindow)
  // console.log(theme)

  // win.appDrawer = new BrowserWindow({
  //   alwaysOnTop: true, frame: false,
  //   thickFrame: false, backgroundColor: '#00000000',
  //   width: 220, // 200 (width) plus 20 (padding for shadow, etc.)
  //   height: 160, // 120 (dialog height) plus 40 (padding for space, search bar height, etc.)
  //   // transparent: true,
  //   resizable: false,
  //   minimizable: false,
  //   skipTaskbar: true,
  //   maximizable: false,
  //   fullscreen: false,
  //   fullscreenable: false,
  //   title: '',
  //   focusable: true,
  //   show: false,
  //   webPreferences: {
  //     nodeIntegration: true,
  //     enableRemoteModule: true,
  //     contextIsolation: false
  //   }
  // })

  win.barWindow.removeMenu()
  win.barWindow.openDevTools({ mode: 'detach' })

  // win.barWindow.loadFile('core/index.html')

  // win.appDrawer.loadFile('widgets/apps/appdrawer.html')

  win.barWindow.once('ready-to-show', async () => {
    logger.debug('Ready to show', 'APP Event')

    win.barWindow.show()
    win.barWindow.setVisibleOnAllWorkspaces(true)
    switch (config.get('look-and-feel.composition')) {
      case 'acrylic' :
        ewc.setAcrylic(win.barWindow, 0xffffff)
        break
      case 'blurbehind':
        ewc.setBlurBehind(win.barWindow, 0x14800020)
        break
      case 'none':
        ewc.setTransparentGradient(win.barWindow, 0x0000000)
        break
      default:
        ewc.setTransparentGradient(win.barWindow, 0x0000000)
        break
    }
  })
})

app.on('window-all-closed', event => {
  logger.debug('Windows closed', 'APP Event')

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', event => {
  logger.debug('Activated', 'APP Event')
})

app.on('moved', (event, bounds) => {
  logger.debug(`Window moved: ${bounds}`, 'APP Event')
})

ipcMain.on('updateComposition', (_, composition) => {
  if (composition === 'acrylic') {
    ewc.setAcrylic(win.barWindow, 0xffffff)
  }

  if (composition === 'blurbehind') {
    ewc.setBlurBehind(win.barWindow, 0x14800020)
  }
})
