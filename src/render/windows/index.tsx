import React from "react"
import ReactDOM from "react-dom"

import '../style/index.css';
import { openSettings } from '../ipc';

import {Zap} from 'react-feather'

ReactDOM.render(<App />, document.getElementById('root'))

function App() {
 

    return <div className="items-center justify-center min-h-screen space-y-5 text-white bg-bg col">
        <div className={`flex flex-col justify-center items-center`}>
            <h1 className="flex text-4xl"><Zap size={36} className={`mr-2`}/>Hyper v0.9.8</h1>
            <p>Now built with</p>
        </div>

        <p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
                <li><a target="_blank" href="https://www.electronjs.org" className="text-blue-500 hover:text-white">Electron</a></li>
                <li><a target="_blank" href="https://reactjs.org/docs/getting-started.html" className="text-blue-500">React</a></li>
                <li><a target="_blank" href="https://tailwindcss.com" className="text-blue-500">Tailwind CSS</a></li>
                <li><a target="_blank" href="https://tailwindcss.com" className="text-blue-500">Parcel</a></li>
                <li><a target="_blank" href="https://tailwindcss.com" className="text-blue-500">Nodge JsWinAPI</a></li>
            </ul>
        </p>

        <hr className="my-2 border-t border-gray-400 w-60" />

        <p className="mt-10 space-y-3 col">
            <button onClick={callIpc} className="px-4 py-2 font-semibold rounded bg-accent">Open Settings</button>        
        </p>
    </div>
}

function callIpc() {
    openSettings()
}