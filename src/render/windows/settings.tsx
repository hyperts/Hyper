import React, { useState } from "react"
import ReactDOM from "react-dom"
import { Config } from "../../shared/config";
import '../style/index.css';

import Titlebar from '../components/settings/titlebar';
import Sidebar from '../components/settings/sidebar/sidebar';

import About from '../components/settings/pages/about';
import Themes from '../components/settings/pages/themes';
import Widgets from '../components/settings/pages/widgets';
import Dynamic from '../components/settings/pages/default';

ReactDOM.render(<App />, document.getElementById('root'))

function App() {
    const [active, SetActive] = useState('About');
    const config = new Config()

    function renderContent(active) {

    }

    return <>
        <Titlebar />
        <div className={`flex w-full h-screen settings-wrapper`}>
            <Sidebar onChange={(reported) => { SetActive(reported) }} active={active} />

            <div className={`flex flex-col w-full h-full px-4 py-12 bg-bg rounded-r-md`} >
                {this.props.children}
            </div>
        </div>
    </>
}
