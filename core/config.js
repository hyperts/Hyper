const fs = require('fs')
const YAML = require('yaml')
const objSearch = require('dot-prop')

class Config {
  constructor (moduleName) {
    if (moduleName) {
      this.path = `widgets\\${moduleName}\\config.yaml`
      this.yaml = fs.readFileSync(require('path').resolve(__dirname, '..', this.path), 'utf8')
    } else {
      this.path = 'config.yaml'
      this.yaml = fs.readFileSync(require('path').resolve(__dirname, '..', this.path), 'utf8')
    }

    this.data = YAML.parse(this.yaml)

    this.get = function (configStr) {
      const stack = objSearch.get(this.data, configStr, undefined)
      return stack
    }

    this.set = function (configStr, value, callback) {
      const line = objSearch.get(this.data, configStr, null)
      if (!line) {
        if (callback) { callback(new Error(`Attempt to save invalid config option < ${configStr} >`)) }
        return
      }
      objSearch.set(this.data, value)
      if (callback) { callback() }
    }

    this.save = function (callback) {
      const toSave = Object.assign({}, this.data)
      delete toSave.get
      delete toSave.save

      fs.writeFileSync(this.path, toSave, 'utf8', callback)
    }
  }
}

module.exports = Config
