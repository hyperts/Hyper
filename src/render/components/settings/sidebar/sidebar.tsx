import React, { Component } from 'react';
import PerfectScrollbar from 'perfect-scrollbar';
import { Config } from '../../../../shared/config';

import '../../../style/index.css';
import '../../../style/settings.module.css';

import Item from './item';

const config = new Config()

type SidebarProps = {
    active: string;
    onChange?: (page: string)=> void;
}
class Sidebar extends Component<SidebarProps> {
    
    generateEntries(entry: string) {
      return Object.keys(config.get(`${entry}.items`)).map( (field)=>{
        const fieldData = config.get(`${entry}.items.${field}`)

        return <Item name={fieldData.name} path={`${entry}.items.${field}`} click={ this.props.onChange } icon={fieldData.icon} active={this.props.active}/>
      })
    }

    generateCategories() {
        return Object.keys(config.getAll()).map( (entry)=> {
            const entryData = config.get(entry)

            return (
                <>
                    <span className={`text-xs text-white opacity-30 category`}>{entryData.name}</span>
                    <ul className={`text-white font-normal mt-3`}>
                        {this.generateEntries(entry)}
                    </ul>
                </>
            )
        })
    }

    componentDidMount(){
       new PerfectScrollbar('#container',{
        wheelSpeed: 2,
        wheelPropagation: true,
        minScrollbarLength: 20
       })
    }

    render() {
        return (
            <div className={`flex flex-row w-1/3 h-full overflow-hidden select-none px-5 py-3 relative pb-12`} id={'container'}>
                <nav className={`w-full h-screen`}>
                    <header className={`flex flex-row text-white mb-8`}>
                        <img src={'assets://logo.svg'} className={`w-3`} />
                        <span className={`ml-5 text-md font-light`}>Settings</span>
                    </header>
                    <span className={`text-xs text-white opacity-30 category`}>Hyper</span>
                    <ul className={`text-white font-normal mt-3`}>
                        <Item name={'About'} path={'hyper.about'} click={ this.props.onChange } icon={"Info"} active={this.props.active}/>
                        {/* <Item name={'Themes'} path={'hyper.themes'} click={ this.props.onChange } icon={"Tag"} active={this.props.active}/>
                        <Item name={'Widgets'} path={'hyper.widgets'} click={ this.props.onChange } icon={"Box"} active={this.props.active}/> */}
                    </ul>
                    {this.generateCategories()}
                    {this.props.children}
                </nav>
            </div>
        );
    }
}

export default Sidebar;