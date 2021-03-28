const config = require('../../config.json');
const appList = require('../../applist.json');
const electron = require('electron');
const { ipcRenderer, ipcMain } = electron;

const cp = require('child_process')

const wrapper = document.createElement('div')
wrapper.classList.add('wrapper');

document.querySelector('body').appendChild(wrapper);

class appListing extends HTMLElement {
  constructor(name, path) {
    super()
    const shadow = this.attachShadow({ mode: 'open' });

    const style = document.createElement('link')
    style.setAttribute('rel', 'stylesheet')
    style.setAttribute('href', 'appdrawer.css')

    const text = document.createElement('a')
    text.classList.add('item')
    text.textContent = name
    text.onclick = function () {
      // console.log('Clicked with path', path )
      ipcRenderer.send('showAppDrawer')
      cp.spawn(path, { detached: true, stdio: 'ignore' })
    }

    shadow.appendChild(style);
    shadow.appendChild(text);
  }
}

customElements.define('app-listing', appListing);

ipcRenderer.on('show', (e, name, prop) => {
  wrapper.innerHTML = ''


  Object.keys(appList[name].applist).forEach((software, index) => {
    const path = appList[name].applist[software]

    const applisting = new appListing(software, path)

    wrapper.appendChild(applisting)
  })

})

ipcMain.on('showAppDrawer', (e, name, prop) => {
  console.log('Received showAPPDRAWER', name, prop)

  // win.appDrawer.webContents.send('show', name, prop)

  // if (!win.appDrawer.isVisible()) {
  //   win.appDrawer.show()

  //   if (config.general.advanced['debug-mode'])
  //     win.appDrawer.webContents.openDevTools({ mode: 'detach' });

  //   win.appDrawer.setPosition(Math.round(Number(prop.x + config.general['look-and-feel']['horizontal-margin'])), Math.round(Number(prop.y - config.general['look-and-feel']['vertical-margin'] * 2)))
  //   win.appDrawer.setSize(Math.round(Number(prop.w)), Math.round(Number(prop.h)))
  // } else {
  //   win.appDrawer.hide()
  // }
})
