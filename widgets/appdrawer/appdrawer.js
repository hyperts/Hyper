const appList = {}

class appx extends HTMLElement {
	constructor() {
		super()

		let style = document.createElement('link')
		style.setAttribute('rel', 'stylesheet')
		style.setAttribute('href', require('path').join('theme://', 'widgets', '/appdrawer/appdrawer.css'))

		const shadow = this.attachShadow({ mode: 'open' });
		shadow.appendChild(style)

		Object.keys(appList).forEach((name, index) => {


			console.log("APPLIST:", index, appList[name])

			const appButton = document.createElement('div');
			appButton.classList.add('app', 'iconless');
			appButton.onclick = function () {
				let bounds = appButton.getBoundingClientRect()
				ipcRenderer.send('showAppDrawer', name, { x: bounds.x, y: bounds.y, w: bounds.width, h: bounds.height })
			}

			const appName = document.createElement('span');
			appName.classList.add('app', 'name')

			if (appList[name].displayIcon) {
				const appIconWrapper = document.createElement('div');
				appIconWrapper.classList.add('app', 'wrapper');

				const appIcon = document.createElement('img');
				appButton.classList.remove('iconless');
				appButton.classList.add('withicon');

				appIcon.src = `images/${appList[name].icon}`

				appButton.appendChild(appIconWrapper);
				appIconWrapper.appendChild(appIcon);

			}

			appName.textContent = name;

			shadow.appendChild(appButton);
			appButton.appendChild(appName);
		})


		// text.textContent = `${getTime()} | ${moment().locale('pt-br').format('ll')}`

		// window.setInterval(() => {
		// 	text.textContent = `${getTime()} | ${moment().locale('pt-br').format('ll')}`
		// }, 2000)
	}
}

customElements.define('apps-widget', appx);
