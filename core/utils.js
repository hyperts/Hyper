const fs = require('fs')
const Config = require(require('path').resolve(__dirname, 'config.js'))
const config = new Config()
const extract = require('extract-zip')
const os = require('os')
const path = require('path')

const Logger = require('@ptkdev/logger')

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
// console.log('CONFIG IN UTILS', config)

function getNativeWhnd (win) {
  const hbuf = win.getNativeWindowHandle()

  if (os.endianness() === 'LE') {
    return hbuf.readInt32LE()
  } else {
    return hbuf.readInt32BE()
  }
}

function calculateMargins (width, height) {
  return {
    w: width - config.get('general.look-and-feel.vertical-margin') * 2,
    h: 32,
    // h: config.general['look-and-feel'].height, // this is not needed anymore because i discovered the fucking windows api trick
    x: config.get('general.look-and-feel.vertical-margin'),
    y: config.get('general.look-and-feel.horizontal-margin')
    // y: config.general['behaviour']['dock-position'] == 'Top' ? ( config.general['look-and-feel'].height < 65 ? -65 + config.general['look-and-feel'].height : 0 ) : height - yMargin // this is not needed anymore because i discovered the fucking windows api trick
  }
}

function commitUserFolder () {
  if (!fs.existsSync(`${os.homedir()}\\.hyperbar`)) {
    fs.mkdirSync(`${os.homedir()}\\.hyperbar`)
  }
}

function createDirOnUserFolder (dir) {
  if (!fs.existsSync(`${os.homedir()}\\.hyperbar\\${dir}`)) {
    fs.mkdirSync(`${os.homedir()}\\.hyperbar\\${dir}`)
  }
}

function getPathOnUserFolder (dir) {
  return `${os.homedir()}\\.hyperbar\\${dir}`
}

async function ensureDefaultTheme () {
  const dir = `${os.homedir()}\\.hyperbar\\themes\\default`
  const dirExists = await fs.existsSync(`${os.homedir()}\\.hyperbar\\themes\\default\\index.html`)

  if (!dirExists) {
    try {
      await extract(path.join(appRoot, 'themes/default.zip'), { dir: dir })
      logger.info('Extracted default theme to userdir', 'APP Event')
    } catch (err) {
      logger.error('Unable to extract default theme to userdir' + err, 'APP Event')
    }
  }
}

// const os = require('os')

module.exports = { calculateMargins, getNativeWhnd, commitUserFolder, createDirOnUserFolder, getPathOnUserFolder, ensureDefaultTheme }
