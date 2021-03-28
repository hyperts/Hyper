
const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8974 })

let musictitle = 'Spotify'
let musicartist = 'Nan'
let musicstate
let musicalbum = ''
let musiccover = 'vagalume.com.br/the-neighbourhood/discografia/wiped-out.jpg'
let musicduration
let musicposition

// Send 'Version:0.4.0.0' to be reconised by the extension
wss.on('connection', function connection(ws) {
  ws.send('Version:0.4.0.0')
  connected = true
  console.log('%c[WEB NOW PLAYING]', 'color: green; background:#161616;, font-size:15px;', '[WEBSOCKET] Connected!')

  ws.on('message', function incoming(data) {
    ws.send(data)

    const content = data.split(':')

    if (content[0].includes('TITLE')) {
      musictitle = content[1]
      // console.log('Music  title: ' + musictitle)
    }
    if (content[0].includes('ARTIST')) {
      musicartist = content[1]
      // console.log('Artist: ' + musicartist)
    }
    if (content[0].includes('ALBUM')) {
      musicalbum = content[1]
      // console.log('Album: ' + musicalbum)
    }
    if (content[0].includes('DURATION')) {
      musicduration = content[1] + ':' + content[2]
      // console.log('Lenght: ' + musicduration)
    }
    if (content[0].includes('POSITION')) {
      musicposition = content[1] + ':' + content[2]
      // console.log('Position : ' + musicposition)
    }
    if (content[0].includes('ALBUM')) {
      musicalbum = content[1]
      // console.log('Album : ' + musicalbum)
    }
    if (content[0].includes('STATE')) {
      musicstate = content[1]
      if (musicstate == 1) { console.log('Music is playing') } else { console.log('Music paused') }
    }

    if (content[0].includes('COVER')) {
      musiccover = `${content[2]}`
    }

    //    console.log(content)
  })

  ws.on('close', function incoming(data) {
    console.log('%c[WEB NOW PLAYING]', 'color: white; background:#78A23D;, font-size:15px;', '[WEBSOCKET] Connection failed')
  })
})

function noop () { }

function heartbeat () {
  this.isAlive = true
}

wss.on('connection', function connection(ws) {
  ws.isAlive = true
  ws.on('pong', heartbeat)
})

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate()

    ws.isAlive = false
    ws.ping(noop)
  })
}, 30000)

wss.on('close', function close() {
  clearInterval(interval)
})

function wrapContentsInMarquee(element) {
  element.classList.add('marquee')
  // let marquee = document.createElement('marquee'),
  // contents = element.innerText

  // marquee.innerText = contents
  // marquee.scrollamount = 2
  // marquee.scrolldelay= 1000
  // element.innerHTML = ''
  // element.appendChild(marquee)
}

function unwrapContents(element) {
  element.classList.remove('marquee')
  // let marquee = element.querySelector('marquee')

  // element.textContent = element.innerText
  // if (marquee) { marquee.remove() }
}

function isElementOverflowing(element) {
  const overflowX = element.offsetWidth < element.scrollWidth
  const overflowY = element.offsetHeight < element.scrollHeight

  return (overflowX || overflowY)
}

class spotifyplayer extends HTMLElement {
  constructor() {
    super()

    const shadow = this.attachShadow({ mode: 'open' })

    const style = document.createElement('link')
    style.setAttribute('rel', 'stylesheet')
    style.setAttribute('href', require('path').join('theme://', 'widgets', '/music/music.css'))

    const box = document.createElement('div')
    box.classList.add('wrapper')
    const text = document.createElement('span')
    text.classList.add('title')
    const coverWrapper = document.createElement('div')
    coverWrapper.classList.add('coverwrapper')
    const cover = document.createElement('img')
    cover.classList.add('cover')

    shadow.appendChild(style)
    shadow.appendChild(box)
    box.appendChild(text)
    shadow.appendChild(coverWrapper)
    coverWrapper.appendChild(cover)

    text.textContent = `${musictitle} - ${musicartist}`
    cover.src = `https://${musiccover}`

    window.setInterval(() => {
      if (`${musictitle} - ${musicartist}` != text.textContent) {
        text.textContent = `${musictitle} - ${musicartist}`
        cover.src = `https://${musiccover}`

        if (isElementOverflowing(text)) {
          wrapContentsInMarquee(box)
        } else {
          unwrapContents(box)
        }
      }

      if (musicstate != 1) {
        unwrapContents(box)
        text.textContent = `[PAUSED] ${musictitle} - ${musicartist}`
      }
    }, 10000)
  }
}

customElements.define('spotify-player', spotifyplayer)
