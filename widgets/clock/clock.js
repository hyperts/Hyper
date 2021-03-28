const moment = require('moment')

const clockConfig = new Config('clock')

class clockWidget extends HTMLElement {
  constructor () {
    super()

    const shadow = this.attachShadow({ mode: 'open' })

    const style = document.createElement('link')
    style.setAttribute('rel', 'stylesheet')
    style.setAttribute('href', require('path').join('theme://', 'widgets', '/clock/clock.css'))

    const text = document.createElement('div')

    shadow.appendChild(text)
    shadow.appendChild(style)

    text.textContent = 'Welcome'
    const locale = String(clockConfig.get('locale')) // let's ensure it's a string...

    window.setInterval(() => {
      text.textContent = `${moment().locale(locale).format('ddd').charAt(0).toUpperCase() + moment().locale(locale).format('ddd').slice(1)} ${moment(new Date()).locale(locale).format('hh:mma')}`
      // console.log(clockConfig)
      // text.textContent = moment(new Date())
    }, 2000)
  }
}

customElements.define('clock-widget', clockWidget)
