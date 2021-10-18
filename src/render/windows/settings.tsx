import React, {useState} from "react"
import ReactDOM from "react-dom"


import '../style/index.css';

import Titlebar from '../components/settings/titlebar';
import Sidebar from '../components/settings/sidebar/sidebar';
import RefreshPrompt from '../components/settings/refreshPrompt';

import About from '../components/settings/pages/about';
import Themes from '../components/settings/pages/themes';
import Widgets from '../components/settings/pages/widgets';
import Dynamic from '../components/settings/pages/default';

ReactDOM.render(<App />, document.getElementById('root'))

function App() {
    const [active, SetActive] = useState('hyper_about.special');
    const [refreshPeding, setPeding] = useState(false)

    function settingChanged() {
        setPeding(true)
    }

    function pageChange(category: string) {
        SetActive(category)
    }

    function renderPage() {
        switch (active) {
            case 'hyper_about.special':
                return <About />
                break;
            case 'hyper_themes.special':
                return <Themes />
            case 'hyper_widgets.special':
                return <Widgets />
            default:
                return <Dynamic active={active} change={settingChanged}/>
        }
    }

     return <>
        <Titlebar />
        <div className={`flex w-full h-screen settings-wrapper`}>
            <Sidebar active={active} onChange={pageChange}/>
            <div className={`flex flex-col w-full px-4 py-12 bg-bg rounded-r-md relative overflow-auto`} >
                {renderPage()}
                {refreshPeding && <RefreshPrompt />}

            </div>
        </div>
    </>
}
