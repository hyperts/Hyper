const workspaceConfig = new Config('workspace')

let currentDesktop = 0
const cp = require('child_process')

// let ps = new shell({executionPolicy: 'Bypass'})
function romanize (num) {
  const lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 }
  let roman = ''
  let i

  for (i in lookup) {
    while (num >= lookup[i]) {
      roman += i
      num -= lookup[i]
    }
  }
  return roman
}

function createSelector (id, wrapper) {
  const workspaceSelector = document.createElement('ul')
  workspaceSelector.classList.add('selector')
  workspaceSelector.id = id

  const indicator = document.createElement('li')
  indicator.textContent = Number(id)

  console.log('Checking current desktop', { VAR: currentDesktop, API: virtualDesktop.GetDesktopCount()})

  if (id === 1) {
    workspaceSelector.classList.add('one')
  }

  if (id === Number(currentDesktop)) {
    workspaceSelector.classList.add('active')
  }

  if (id === Number(virtualDesktop.GetDesktopCount())) {
    workspaceSelector.classList.add('last')
  }

  workspaceSelector.onclick = function () {
    if (workspaceConfig.get('animate-desktop-switch')) {
      const run = String('switchDesktopAnimated.exe' + ' ' + indicator.textContent)
      cp.exec(run, { cwd: require('path').join(appRoot, '/includes') }, (err) => {
        currentDesktop = virtualDesktop.GetCurrentDesktopNumber() + 1
        console.log('ran', err)
        checkSelectors(wrapper)
      })
      console.log('Runned: ', run)
    } else {
      console.log('Switching desktop. Animation:', workspaceConfig.get('animate-desktop-switch'))
      virtualDesktop.GoToDesktopNumber(indicator.textContent - 1)
      setTimeout(() => {
        checkSelectors(wrapper)
      }, 100)
    }
  }

  workspaceSelector.appendChild(indicator)
  wrapper.appendChild(workspaceSelector)

  return { workspaceSelector, indicator }
}

function checkSelectors(wrapper) {
  const selectors = wrapper.querySelectorAll('.selector')

  selectors.forEach((element, index) => {
    const id = Number(element.id)

    if (id !== currentDesktop && element.classList.contains('active')) {
      element.classList.remove('active')
    }

    if (id !== Number(virtualDesktop.GetDesktopCount()) && element.classList.contains('last')) {
      element.classList.remove('last')
    }

    if (id === currentDesktop) {
      element.classList.add('active')
    }

    if (id === Number(virtualDesktop.GetDesktopCount())) {
      element.classList.add('last')
    }

    if (id > Number(virtualDesktop.GetDesktopCount())) {
      element.remove()
    }
  })

  if (selectors.length < virtualDesktop.GetDesktopCount()) {
    console.log('Identified elements missing', virtualDesktop.GetDesktopCount() - selectors.length)

    for (let i = 0; i <  virtualDesktop.GetDesktopCount() - selectors.length; i++) {
      createSelector(selectors.length + (i + 1), wrapper)
    }
  }
}

class workspacemanager extends HTMLElement {
  constructor () {
    super()

    const shadow = this.attachShadow({ mode: 'open' })

    const style = document.createElement('link')
    style.setAttribute('rel', 'stylesheet')
    style.setAttribute('href', require('path').join('theme://', 'widgets', '/workspace/workspace.css'))

    const wrapper = document.createElement('div')
    wrapper.classList.add('wrapper')

    shadow.appendChild(style)
    shadow.appendChild(wrapper)

    currentDesktop = virtualDesktop.GetCurrentDesktopNumber() + 1

    for (let i = 0; i < virtualDesktop.GetDesktopCount(); i++) {
      createSelector(i + 1, wrapper)
    }

    const addNew = document.createElement('div')
    addNew.classList.add('add')
    addNew.innerHTML = feather.icons.plus.toSvg({ 'stroke-width': 1, fill: '#505254' })

    addNew.onclick = function (el) {
      createSelector(virtualDesktop.GetDesktopCount() + 1, wrapper)
      wrapper.appendChild(addNew)

      let run = String('createNewDesktop.exe')
      cp.exec(run, { cwd:require('path').join(appRoot, '/includes') }, () => {
        checkSelectors(wrapper)
      })
    }

    wrapper.appendChild(addNew)

    window.setInterval(() => {
      currentDesktop = virtualDesktop.GetCurrentDesktopNumber() + 1
      checkSelectors(wrapper)
      wrapper.appendChild(addNew)
    }, 4000)


    this.addEventListener('wheel', function (e) {
      currentDesktop = virtualDesktop.GetCurrentDesktopNumber() + 1

      console.log('Current desktop:', currentDesktop, '\nDesired desktop:', e.deltaY > 0 ? currentDesktop - 1 : currentDesktop + 1, '\n Max:', virtualDesktop.GetDesktopCount())

      const desiredDesktop = e.deltaY > 0 ? currentDesktop - 1 : currentDesktop + 1

      if (workspaceConfig.get('animate-desktop-switch')) {
        const run = String('switchDesktopAnimated.exe' + ' ' + desiredDesktop)
        cp.exec(run, { cwd:require('path').join(appRoot, '/includes') }, () => {
          checkSelectors(wrapper)
        })
      } else {
        virtualDesktop.GoToDesktopNumber(e.deltaY > 0 ? virtualDesktop.GetCurrentDesktopNumber() - 1 : virtualDesktop.GetCurrentDesktopNumber() + 1)
        currentDesktop = e.deltaY > 0 ? virtualDesktop.GetCurrentDesktopNumber() - 1 : virtualDesktop.GetCurrentDesktopNumber() + 1
        setTimeout(() => {
          checkSelectors(wrapper)
        }, 500)
      }
    })
  }
}

customElements.define('workspace-widget', workspacemanager)
