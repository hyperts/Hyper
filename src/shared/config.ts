import  fs from 'fs'
import { homedir } from 'os';
import YAML from 'yaml'
import * as objSearch from 'dot-prop'

// Why it's a class:
// It used to handle configs for each module
// But now modules will inject their config options to a single file on hyperdir

export class Config {

  public get: (configStr: string) => object|undefined;
  public getAll: () => Array<ConfigEntry>;
  public set: (configStr: string, value: any, callback: (Error?: Error)=> void) => void;
  public save: (callback: () => void) => void;
  private path: string;
  private yaml: string;
  private data: object;

  constructor () {
    this.path = `${homedir()}\\.hyperbar\\config.yaml`
    this.yaml = fs.readFileSync(this.path, 'utf8').toString()

    this.data = YAML.parse(this.yaml)

    this.get = function (configStr) {
      const stack = objSearch.get(this.data, configStr, undefined)
      return stack
    }

    this.getAll = function() {
      return this.data
    }

    this.set = function (configStr, value, callback) {
      const line = objSearch.get(this.data, configStr, null)
      if (!line) {
        if (callback) { callback(new Error(`Attempt to save invalid config option < ${configStr} >`)) }
        return
      }
      objSearch.set(this.data, configStr, value)
      if (callback) { callback() }
    }

    this.save = function (callback: ()=> void) {
      const toSave = Object.assign({}, this.data)
      delete toSave.get
      delete toSave.save

      fs.writeFileSync(this.path, toSave, 'utf8')
      if (callback) { callback() }
    }
  }
}
