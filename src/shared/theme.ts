import chokidar from 'chokidar'
import {ipcRenderer, app} from 'electron'
import { Config } from './config'
import { readdirSync, existsSync, readFileSync, lstatSync } from 'fs'
import log from 'electron-log'
import { join } from 'path'
import { homedir } from 'os'
const logger = log.scope('THEME')

type CssVar = {
  name: string;
  value: string
}

type Theme = {
  name: string;
  author?: string;
  repository?: string;
  dependency?: string[];
  version?: string;
  supportedWidgets?: string[];
  file: string;
  folder: string;
}

class ThemeRepository {
  private isRenderer: boolean
  private config: Config
  public varList: CssVar[]
  public installedThemes: Theme[]
  public activeTheme: Theme | undefined;

  constructor() {
    this.config = new Config()
    this.isRenderer = process && process.type === 'renderer'
    this.varList = []
    this.installedThemes = []
  }

  public setVars() {
    const dockedTop = this.config.getValue('general', 'position', 'dock-pos') === 'top'
    const barHeight = this.config.getValue('appearence', 'sizes', 'height') as number
    const barPadding = this.config.getValue('appearence', 'sizes', 'padding') as number
    const offset = (dockedTop
      ? barHeight < 39
        ? (barHeight - 39) * - 1
        : 0
      : 0)
    const accentColor = this.config.getValue('appearence', 'color', 'accent') as string
    const primaryColor = this.config.getValue('appearence', 'color', 'primary') as string
    const secondaryColor = this.config.getValue('appearence', 'color', 'secondary') as string

    this.varList.push({ name: 'barsize', value: `${barHeight}px` })
    this.varList.push({ name: 'padding', value: `${barPadding}px` })
    this.varList.push({ name: 'offset', value: `${offset}px` })

    this.varList.push({ name: 'accent', value: accentColor })
    this.varList.push({ name: 'primary', value: primaryColor })
    this.varList.push({ name: 'secondary', value: secondaryColor })

    if (!this.isRenderer) {
      app.on('browser-window-created', (e, window) => {
        const cssStr = this.varList.map( variable => {
          return `--${variable.name}: ${variable.value}`
        })
        window.webContents.insertCSS(`
          :root {
            ${cssStr.join(';')}
          }
        `)
      })
      
      return
    }
  }

  setup() {
    this.setVars()
    this.varList.forEach(variable => {
      document.documentElement.style.setProperty(`--${variable.name}`, variable.value)
    })
    const style = document.createElement('link')
    style.setAttribute('rel', 'stylesheet')
    style.setAttribute('href', `theme://index.css`)
  
    document.head.appendChild(style)
    
    this.watchTheme()
  }

  install() {

  }

  uninstall() {

  }

  listThemes() {
    return this.installedThemes
  }

  validate() {
    const currentThemeList = this.config.getField('general', 'appearence', 'theme').options as string[]
    let tempList: string[] = []
    this.installedThemes.forEach(theme => {
      const path = theme.file.split('\\themes\\')
      const directory = path[path.length - 1].split('\\')[0]

      if (!currentThemeList.includes(directory)) {
        tempList = [...tempList, directory]
      } 

      if ( this.config.getValue('general', 'appearence', 'theme') === directory) {
        this.activeTheme = theme
      }
    })
    
    this.config.data.appearence.items.theme.fields.selected.options = tempList
    this.config.save()
  }

  private loadTheme(theme: string, path: string) {
    const themePath = join(path, theme);
    const themePathManifest = join(themePath, 'manifest.json');

    if (!existsSync(themePath)) {
      logger.warn(`Path [${themePath}] is invalid`);
      return;
    }

    if (!existsSync(themePathManifest)) {
      logger.warn(`Failed to load [${themePath}]\n > ${themePathManifest} does not exist`);
      return;
    }

    const stats = lstatSync(path)

    if (stats && !stats.isDirectory()) {
      logger.warn(`Detected invalid file in widgets path.\n - You forgot to extract the widget?\n - Widget files must be on their own folder, not directly on widgets directory.\n - This file will not be loaded.`)
    }


    const themeInfo = JSON.parse(readFileSync(themePathManifest).toString());
    themeInfo.file = themePathManifest

    this.installedThemes.push(themeInfo)
  }

  loadThemes() {
    this.themesPath.forEach(path => {
      const themes = readdirSync(path);

      themes.forEach(theme => {
        this.loadTheme(theme, path);
      })
    });
  }

  watchTheme() {

    const watchThemes = this.config.getValue('general', 'misc', 'watch-themes')
    if (!watchThemes) { return }

    const watcher = chokidar.watch(this.themesPath)

    watcher.on('change', () => { ipcRenderer.send('forceReload') })

  }

  get themesPath() {
    const paths = [
      join(homedir(), "./.hyperbar/themes"),
    ];

    return paths;
  }

}

export default ThemeRepository