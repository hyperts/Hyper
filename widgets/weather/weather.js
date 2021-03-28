const axios = require('axios');
// const config = require('../config.json');

const condicons = [
  'storm', 'storm', 'storm', 'storm', 'storm', 'snow', 'showers', 'snow', 'showers', 'showers', 'showers',
  'showers', 'showers', 'snow', 'snow', 'snow', 'snow', 'snow', 'snow', 'fog', 'fog',
  'fog', 'fog', 'windy', 'windy', 'snow', 'overcast', 'few-clouds-night', 'few-clouds', 'few-clouds-night', 'few-clouds',
  'clear-night', 'clear', 'clear-night', 'clear', 'snow', 'clear', 'storm', 'storm', 'storm', 'showers-scattered',
  'snow', 'snow', 'snow', 'few-clouds', 'storm', 'snow', 'storm'
]

function getWeather(callback) {
  const url = `https://weather.service.msn.com/find.aspx?src=outlook&weadegreetype=F&culture=${config.locale}&weasearchstr=${config.cityName}`

  axios.get(url)
    .then(resp => {
      callback(resp.data);
    })
    .catch(respot => {

    })
}

class weatherWidget extends HTMLElement {
  constructor () {
    super()

    const shadow = this.attachShadow({ mode: 'open' });

    const style = document.createElement('link')
    style.setAttribute('rel', 'stylesheet')
    style.setAttribute('href', require('path').join('theme://', 'widgets', '/weather/weather.css'));

    const icon = document.createElement('img')
    icon.id = 'icon'

    const conditionDiv = document.createElement('div')
    conditionDiv.id = 'condition'

    shadow.appendChild(icon)
    shadow.appendChild(conditionDiv)
    shadow.appendChild(style)

    const updateWeather = () => {
      console.log('Running get weather from updateWeather')
      getWeather((xml) => {
        console.log('Running the callback')
        const wea = new DOMParser().parseFromString(xml, 'text/xml')
        const temperature = wea.getElementsByTagName('current')[0].getAttribute('temperature')
        const feel = wea.getElementsByTagName('current')[0].getAttribute('feelslike')
        const code = wea.getElementsByTagName('current')[0].getAttribute('skycode')
        const condition = wea.getElementsByTagName('current')[0].getAttribute('skytext')
        conditionDiv.textContent = `${Math.round((temperature - 32) * 5 / 9)}°c ${config.showClimateCondition ? '| ' + condition : ''}`
        icon.src = 'theme://assets/weather/weather-' + condicons[code] + '-symbolic.svg'
        // console.log('Got weather', temperature, condition)
        switch (condicons[code]) {
          case 'clear-night':
          case 'few-clouds-night':
            this.className = 'night'
            break;
          case 'few-clouds':
          case 'overcast':
          case 'showers':
          case 'showers-scattered':
            this.className = 'rainy'
            break;
          case 'snow':
            this.className = 'snowy'
            break;
          default:
            this.className = ''
        }
      })
    }

    updateWeather()
    window.setInterval(updateWeather, 10 * 60 * 1000)
    console.log('Loaded weather widget')
  }
}

customElements.define('weather-widget', weatherWidget);
