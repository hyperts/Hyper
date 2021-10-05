import WidgetRepository from '../shared/widget'
import { Config } from '../shared/config'
import feather from 'feather-icons'
import {ipcRenderer, Menu} from 'electron'

export function loadWidgets() {
  const widgetController = new WidgetRepository()

  widgetController.loadWidgetsInPaths(true)

  widgetController.loadedWidgets.forEach(widget => {
    widget?.run( {
      config:  new Config(),
      ipc: ipcRenderer,
      menu: Menu,
      window: window
  })
  })
  feather.replace()
}

export function loadTheme() {
  const themeConfig = new Config('appearence.items.theme.fields.selected')
  
  const style = document.createElement('link')
  style.setAttribute('rel', 'stylesheet')
  style.setAttribute('href', `theme://${themeConfig.get('value')}/index.css`)

  document.head.appendChild(style)

}