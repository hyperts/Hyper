import React, {useEffect} from "react"
import ReactDOM from "react-dom"

import '../style/index.css';

//@ts-ignore
import {loadWidgets, loadTheme} from '../utils'

// import { openSettings } from '../ipc';

// import {Zap} from 'react-feather'

ReactDOM.render(<App />, document.getElementById('root'))


function App() {

    const loadedWidgets = loadWidgets()
    
    useEffect(() => {
        loadedWidgets.map( widget =>{
            widget.styles?.forEach( style => {
                const head = document.querySelector('head')
                const directory = widget.file.split('\\widgets\\')

                if (head) { head.innerHTML += `<link rel="stylesheet" href="widgets://${directory[directory.length -1].split('\\')[0]}/${style}" type="text/css"/>`; }
            })
        })
        loadTheme()
    }, [])


    return <div id="hyperbar" className="flex flex-row">
        {
            loadedWidgets.map(widget =>{
                return widget.default()
            })
        }
    </div>
}
