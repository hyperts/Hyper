import  fs from 'fs'
import { homedir } from 'os';
import YAML from 'yaml'
import * as objSearch from 'dot-prop'

export class Config {

  public get: (configStr: string) => ConfigEntry|any;
  public getAll: () => any;
  public set: (configStr: string, value: any, callback: (Error?: Error)=> void) => void;
  public save: (callback: () => void) => void;
  private path: string;
  private yaml: string;
  readonly data: any|undefined;

  constructor (entry?: string) {
    this.path = `${homedir()}\\.hyperbar\\config.yaml`
    this.yaml = fs.readFileSync(this.path, 'utf8').toString()

    if (!entry) {
      this.data = YAML.parse(this.yaml)
    } else {
      this.data = objSearch.get(YAML.parse(this.yaml), entry)
    }

    this.get = function (configStr) {
      const stack = objSearch.get(this.data, configStr, undefined)
      return stack
    }

    this.getAll = function() {
      return this.data
    }

    this.set = function (configStr, value, callback) {
      if (this.data) {
        objSearch.set(this.data, `${configStr}.value`, value)
      } else {
        callback(new Error(`No data found for < ${configStr} >`))
      }
      if (callback) { callback() }
    }

    this.save = function (callback: ()=> void) {
      fs.writeFileSync(this.path, YAML.stringify(this.data), 'utf8')
      if (callback) { callback() }
    }
  }
}
