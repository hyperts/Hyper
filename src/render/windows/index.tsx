import React, {useEffect} from "react"
import ReactDOM from "react-dom"

import '../style/index.css';

import {loadWidgets, loadTheme} from '../utils'

// import { openSettings } from '../ipc';

// import {Zap} from 'react-feather'

ReactDOM.render(<App />, document.getElementById('root'))


function App() {
    
    useEffect(() => {
        loadWidgets()
        loadTheme()
    }, [])


    return <div id="hyperbar" className="flex flex-row">

    </div>
}
