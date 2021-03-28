const fs = require('fs')
const os = require('os')
const Logger = require('@ptkdev/logger')
const logger = new Logger()

const Config = require('./config.js')
const config = new Config()

// const { dialog } = require('electron')

class Theme {
  constructor (themeName) {
    this.name = themeName
    this.path = `${os.homedir()}\\.hyperbar\\themes\\${this.name}`

    this.initialize = function (window) {
      if (!fs.existsSync(this.path)) {
        logger.error(`Failed attempt at loading < ${this.name} > theme! : Directory missing.`, 'Theme loader')
        process.exit(127)
      }

      const html = fs.readFileSync(`${this.path}\\index.html`, 'utf8')
      window.loadURL('data:text/html;charset=utf-8,' + html)
      // window.loadFile(`${this.path}\\index.html`)
      // const css =
      // fs.readdirSync(this.path).forEach(item => {
      //   const stat = fs.lstatSync(`${this.path}\\${item}`)

      //   if (stat.isFile()) {
      //     console.log('Theme file:', item)

      //   } else {
      //     console.log('Theme folder:', item)
      //   }
      // })
    }

    this.set = function (themeName) {
      config.set('general.look-and-feel.theme', themeName)
    }

    this.getActive = function () {
      return config.get('general.look-and-feel.theme')
    }
  }
}

async function getThemeList () {
  const themeList = []
  const path = `${os.homedir()}\\.hyperbar\\themes\\`

  await fs.promises.readdir(path)
    .then(async fileList => {
      for (const index in fileList) {
        const item = fileList[index]

        await fs.promises.lstat(`${path}\\${item}`)
          .then(stat => {
            if (stat.isFile()) { return }
            themeList.push(item)
          })
          .catch(err => console.log(err))
      }
    })
    .catch(err => console.log(err))

  return themeList
}

module.exports = { Theme, getThemeList }
