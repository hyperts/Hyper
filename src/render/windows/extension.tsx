import React, {useState, useEffect} from "react"
import ReactDOM from "react-dom"
import TitleBar from "../components/extensions/TitleBar";
import Welcome from "../components/extensions/pages/Welcome";
import Home from "../components/extensions/pages/Home";

import '../style/index.css';
import { ipcRenderer } from 'electron';


ReactDOM.render(<App />, document.getElementById('root'))


function App() {
    const [showTutorial, setShowTutorial] = useState(true)

    useEffect(()=>{
        ipcRenderer.on('extensionWindowHideTutorial', () =>{
            setShowTutorial(false)
        })
    }, [])

    return <div className="flex flex-col w-full h-screen rounded-md select-none bg-bg">
        <TitleBar title={showTutorial ? 'Introduction' : 'Community Center'}/>
        { showTutorial ? <Welcome /> : <Home /> }
    </div>
}
