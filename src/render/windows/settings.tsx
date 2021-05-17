import React, {useState} from "react"
import ReactDOM from "react-dom"
// import { Config } from "../../shared/config";
import '../style/index.css';

import Titlebar from '../components/settings/titlebar';
import Sidebar from '../components/settings/sidebar/sidebar';

import About from '../components/settings/pages/about';
import Themes from '../components/settings/pages/themes';
import Widgets from '../components/settings/pages/widgets';
import Dynamic from '../components/settings/pages/default';

ReactDOM.render(<App />, document.getElementById('root'))

function App() {
    const [active, SetActive] = useState('hyper.about');

    function settingChanged() {

    }

    function pageChange(path: string) {
        SetActive(path)
    }

    function renderPage() {
        switch (active) {
            case 'hyper.about':
                return <About />
                break;
            case 'hyper.themes':
                return <Themes />
            case 'hyper.about.widget':
                return <Widgets />
            default:
                return <Dynamic path={active} change={settingChanged}/>
        }
    }

    return <>
        <Titlebar />
        <div className={`flex w-full h-screen settings-wrapper`}>
            <Sidebar active={active} onChange={pageChange}/>
        </div>
    </>
}
