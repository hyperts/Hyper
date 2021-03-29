const fs = require('fs')
const { getCurrentWindow, Menu, MenuItem, screen, app, nativeImage } = require('@electron/remote')
const appPath = app.getAppPath()
const { win32, virtualDesktop, ffi } = require(require('path').resolve(appPath, 'includes/sysapi.js'))

const { getPathOnUserFolder } = require(require('path').resolve(appPath, 'core/utils.js'))
const Logger = require('@ptkdev/logger')
const Config = require(require('path').resolve(appPath, 'core/config.js'))
const feather = require('feather-icons')
const chokidar = require('chokidar')

const logPath = getPathOnUserFolder('logs')
const logger = new Logger({
  language: 'en',
  colors: true,
  write: true,
  path: { debug_log: `${logPath}\\cl_debug.log`, error_log: `${logPath}\\cl_errors.log` }
})

const config = new Config()
const barElement = document.querySelector('.bar')
const barwindow = getCurrentWindow()
const widgets = []

const tasks = {}
logger.info('Starting windowProc', 'CORE')

const windowProc = ffi.Callback('bool', ['long', 'int32'], async function (hwnd, lParam) {
  if (virtualDesktop.ViewIsShownInSwitchers(hwnd) < 1) {
    return true
  }

  const buf = new Buffer.alloc(1024)
  const ret = win32.GetWindowTextW(hwnd, buf, 1024)
  const name = buf.toString('ucs2').replace(/\0+$/, '')

  tasks[hwnd] = {
    name: name,
    hwnd: hwnd
  }

  logger.debug('Added window ' + hwnd + ' to task list', 'CORE')

  return true
})

win32.EnumWindows(windowProc, 0)

// Setting root variables for the css, theme creators may need to know the bar height.
document.documentElement.style.setProperty('--bar-height', config.get('general.look-and-feel.height') + 'px')

// fs.readdir(getPathOnUserFolder(`themes/${config.get('general.look-and-feel.theme')}/widgets`)) // Widgets folder (userDIR)
fs.readdir(require('path').resolve(appPath, 'widgets'), function (err, widgetList) {
  if (err) { logger.error('Error while loading widget' + err); return }

  widgetList.forEach(widget => {
    logger.info('Loading widget ' + widget, 'CORE')
    widgets[widget] = document.createElement('script')
    widgets[widget].src = `core://widgets/${widget}/${widget}.js`
    document.body.appendChild(widgets[widget])
  })
})

// Making the context menu
const menu = new Menu()

barElement.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  menu.popup(barwindow)
}, false)

menu.append(new MenuItem({
  label: 'Settings',
  icon: nativeImage.createFromPath(require('path').resolve(appPath, 'assets', 'contextmenu') + '/console.png').resize({ width: 16, height: 16 }),
  click: () => {

  }
}))

menu.append(new MenuItem({
  label: 'Open themes folder',
  icon: nativeImage.createFromPath(require('path').resolve(appPath, 'assets', 'contextmenu') + '/console.png').resize({ width: 16, height: 16 }),
  click: () => {
    barwindow.openDevTools({ mode: 'detach' })
  }
}))

if (config.get('general.advanced.debug-mode')) {
  menu.append(new MenuItem({
    label: 'Fix position',
    icon: nativeImage.createFromPath(require('path').resolve(appPath, 'assets', 'contextmenu') + '/move.png').resize({ width: 16, height: 16 }),
    click: () => {
      const { calculateMargins } = require(require('path').resolve(appPath, 'includes/utils.js'))
      const { width, height } = screen.getPrimaryDisplay().workAreaSize
      const { x, y } = calculateMargins(width, height)

      barwindow.setPosition(x, y)
    }
  }))

  menu.append(new MenuItem({
    label: 'Open devConsole',
    icon: nativeImage.createFromPath(require('path').resolve(appPath, 'assets', 'contextmenu') + '/console.png').resize({ width: 16, height: 16 }),
    click: () => {
      barwindow.openDevTools({ mode: 'detach' })
    }
  }))
}

menu.append(new MenuItem({
  label: 'Reload',
  icon: nativeImage.createFromPath(require('path').resolve(appPath, 'assets', 'contextmenu') + '/require.png').resize({ width: 16, height: 16 }),
  click: () => {
    app.relaunch()
    app.exit()
  }
}))

menu.append(new MenuItem({
  label: 'Quit',
  icon: nativeImage.createFromPath('./assets/contextmenu/quit.png').resize({ width: 16, height: 16 }),
  click: () => {
    app.quit()
  }
}))

function reloadCss () {
  const links = document.getElementsByTagName('link')
  for (const cl in links) {
    const link = links[cl]
    if (link.rel === 'stylesheet') {
      // link.href = link.href + ''
      // window.location.reload()
      barwindow.reload()
      // document.head.appendChild(link)
    }
  }
}

let watchDir = getPathOnUserFolder(`themes/${config.get('general.look-and-feel.theme')}`)
watchDir = watchDir.replaceAll('\\', '/')

logger.info('Starting chokidar to watch theme directory', 'CORE')
const watcher = chokidar.watch(watchDir, {
  ignored: function (path, stat) {
    if (path.match(/(^|[\\])\../)) { return false }
    if (!path.endsWith('.css')) { return false }
  }, // ignore dotfiles
  persistent: true
})

watcher
  .on('change', path => {
    logger.info('Detected CSS Change :: Reloading!', 'CORE')
    reloadCss()
  })
