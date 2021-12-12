import React, {useLayoutEffect} from "react"
import ReactDOM from "react-dom"

import '../style/index.css';

//@ts-ignore
import {loadWidgets, loadThemes} from '../utils'
import {openSettings, openContext} from '../ipc'

ReactDOM.render(<App />, document.getElementById('root'))


function App() {
    const loadedWidgets = loadWidgets()

    useLayoutEffect(() => {
        loadThemes()
    }, [])

    return <div id="hyperbar" className="flex flex-row"   onContextMenu ={(e)=>{
        if (e.ctrlKey) {
            openContext()
        }
      }}>
        { loadedWidgets.map(widget =>{
            if (typeof widget.default === 'function') {
                //@ts-expect-error
                return <widget.default key={widget.name}/>
            }
        }) }
        {/* Using plain CSS, just in case there's also no themes loaded... for some reason */}
        {loadedWidgets.length <= 0 && 
        <div 
            style={{
                mixBlendMode: 'difference', 
                color: 'white', 
                padding: 6, 
                fontWeight: 'normal', 
                width: '100%', 
                textAlign: 'center',
                cursor: 'pointer'
            }}
            onClick={openSettings}
        >
           No widget loaded - Click to open settings
        </div>}
    </div>
}
