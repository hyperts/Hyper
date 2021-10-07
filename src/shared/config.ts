import  fs from 'fs'
import { homedir } from 'os';
import YAML from 'yaml'
import * as objSearch from 'dot-prop'
import { ConfigTable, ConfigCategory, ConfigItem, ConfigField } from '../@types/hyper'

export class Config {

 /**
  * Returns data using any object path
  * ex: <Config>.get("mario.items") -- will return object with all <ConfigField> objects from the category mario
  * @return {any} The path content
  */
  public get: (configStr: string) => any;
  /**
   * Returns the value from specified field
   * @param {string} category The category which field belongs.
   * @param {string} field The field name
   * @return {string | boolean | number} The field value
   */
  public getValue: (category: string, entry: string, field: string) => string | boolean | number;
  /**
   * Returns a category object with the provided key and
   * @return {ConfigEntry | undefined} The category object or undefined
   */
  public getCategory: (category: string) => ConfigCategory;
  /**
   * Returns the item object with provided keys
   * @param {string} category The category which contains the wanted item
   * @param {string} item The wanted item
   * @return {ConfigItem} The item object
   */
  public getItem: (category: string, entry: string) => ConfigItem;
  /**
   * Returns the item object with provided keys
   * @param {string} category The category which contains the wanted field
   * @param {string} entry The wanted item which the field belongs to
   * @param {string} field The field name
   * @return {ConfigField} The field object
   */
  public getField: (category: string, entry: string, field:string) => ConfigField;
  /**
   * Set's a new value to the specified category and field value
   * @param {string} category Category where the desired entry
   * @param {string} entry Config entry where the desired field is
   * @param {string} field Field to change value
   * @param {string | boolean | number} value The value to be inserted
   * @param {(Error?: Error) => void} callback Action callback, will be called after the save procedure, may return Error.
   */
  public set: (category: string, entry: string, field: string, value: string | boolean | number, callback: (Error?: Error)=> void) => void;
  /**
   * Saves the current config values to the user directory
   * Without running this, every change on config will be reverted back to normal state
   * @param {function} [callback] Callback function to run after saving
   */
  public save: (callback?: () => void) => void;
  /**
   * Inserts a new category to the config table
   * @param {string} category The category name
   * @param {ConfigItem} data The data to be inserted
   * @return {string} String with the object path (to be used withing config.get())
   */
  public insert: (category:string, data: ConfigItem) => string;
  /**
   * Adds a new field under specified category
   * @param {string} category The category name
   * @param {ConfigField} field The field with all of it's data to be added
   * @return {string} path the object path to the newly added field
   */
  public addField: (category:string, data: ConfigField) => string;
  private path: string;
  private yaml: string;
  /**
   * The user config table itself or any other part of it based on the path used in constructor
   * If the constructor is empty, this will return the entire config table (ConfigTable type)
   */
  readonly data: ConfigTable | ConfigCategory | ConfigItem | ConfigField | any;

  constructor (entry?: string) {
    this.path = `${homedir()}\\.hyperbar\\config.yaml`
    this.yaml = fs.readFileSync(this.path, 'utf8').toString()

    if (!entry) {
      this.data = YAML.parse(this.yaml)
    } else {
      this.data = objSearch.get(YAML.parse(this.yaml), entry) as any
    }

    this.get = function (configStr) {
      const stack = objSearch.get(this.data, configStr, undefined)
      return stack
    }

    this.getCategory = function (category: string) {
      const stack = objSearch.get(this.data, `${category}`) as ConfigCategory
      return stack
    }

    this.getItem = function (category: string, entry: string) {
      const stack = objSearch.get(this.data, `${category}.items.${entry}`) as ConfigItem
      return stack
    }

    this.getField = function(category: string, entry: string, field:string) {
      const stack = objSearch.get(this.data, `${category}.items.${entry}.fields.${field}`) as ConfigField
      return stack
    }

    this.getValue = function (category: string, entry: string, field: string) {
      const stack = objSearch.get(this.data, `${category}.items.${entry}.fields.${field}.value`) as string | number | boolean
      return stack
    }


    this.set = function (category, entry,  field, value, callback) {
      if (this.data) {
        objSearch.set(this.data, `${category}.items.${entry}.fields.${field}.value`, value)
      } else {
        callback(new Error(`No data found for < ${category}.fields.${field} >`))
      }
      if (callback) { callback() }
    }

    this.insert = function( category,{name, description, icon} ) {
      const categoryKey = category.toLocaleLowerCase().replace(' ', '_')

      if (!this.data[categoryKey]) {
        this.data[categoryKey] = {
          name: category,
          items: {
            name,
            description,
            icon,
            fields: []
          }
        }
      }

      return categoryKey

    }

    this.addField = function(category, {name, description, type, value, options}) {
      const categoryKey = category

      const explodedKey = name.split(" ")
      const key = explodedKey.join("_").toLowerCase()

      objSearch.set(this.data, `${categoryKey}.items.fields.${key}`, {
        name,
        description,
        type,
        value,
        options
      })

      return `${categoryKey}.items.fields.${key}`
    }

    this.save = function (callback) {
      fs.writeFileSync(this.path, YAML.stringify(this.data), 'utf8')
      if (callback) { callback() }
    }
  }
}
