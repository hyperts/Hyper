const Sortable = require('sortablejs')
const { win32, virtualDesktop, ffi } = require(require('path').resolve(appPath, 'includes/sysapi.js'))

class tasker extends HTMLElement {
  constructor () {
    super()

    const shadow = this.attachShadow({ mode: 'open' })

    // CSS FILE
    const style = document.createElement('link')
    style.setAttribute('rel', 'stylesheet')
    style.setAttribute('href', require('path').join('theme://', 'widgets', '/taskbar/taskbar.css'))

    shadow.appendChild(style)

    const ul = document.createElement('ul')

    Sortable.create(ul, {
      animation: 600,
      ghostClass: 'dragging',
      fallbackOnBody: true,
      easing: 'cubic-bezier(1, 0, 0, 1)',
      direction: () => { return 'horizontal' }
    })

    ul.addEventListener('mousewheel', (e) => {
      var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))
      ul.scrollLeft -= (delta * 40) // Multiplied by 40

      e.preventDefault()
    }, false)
    let i = 0
    const windowProc = ffi.Callback('bool', ['long', 'int32'], function (hwnd, lParam) {
      if (virtualDesktop.ViewIsShownInSwitchers(hwnd) < 1) {
        return true
      }

      let buf, ret
      buf = new Buffer.alloc(1024)
      ret = win32.GetWindowTextW(hwnd, buf, 1024)
      const name = buf.toString('ucs2').replace(/\0+$/, '')

      console.log('Running', name)
      console.log(i++)
      // CONTAINER
      const li = document.createElement('li')
      li.classList.add('task')
      li.id = hwnd

      li.textContent = name

      ul.appendChild(li)

      li.draggable = true

      // let hooks = hooks.CustomWndProc(hwnd, 513, )

      return true
    })

    shadow.appendChild(ul)

    win32.EnumWindows(windowProc, 0)
  }
}

customElements.define('task-bar', tasker)
