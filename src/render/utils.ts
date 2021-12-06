import WidgetRepository from '../shared/widget'
import ThemeRepository from '../shared/theme'

export function loadWidgets() {
  const widgetController = new WidgetRepository()
  widgetController.loadWidgetsInPaths(true)
  widgetController.watchWidgets()
  widgetController.loadStyles()
  return widgetController.loadedWidgets
}

export function loadThemes() {
  const themeController = new ThemeRepository()
  themeController.loadThemes()
  themeController.setup()
}

