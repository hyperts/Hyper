const Sortable = require('sortablejs')
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
      const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))
      ul.scrollLeft -= (delta * 40) // Multiplied by 40

      e.preventDefault()
    }, false)

    shadow.appendChild(ul)

    setTimeout(() => {
      for (const hwnd in tasks) {
        const window = tasks[hwnd]

        const li = document.createElement('li')
        li.classList.add('task')
        li.id = window.hwnd
        li.textContent = window.name

        ul.appendChild(li)
      }
    }, 5000)
  }
}
customElements.define('task-bar', tasker)
