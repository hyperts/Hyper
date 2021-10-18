import React, { Component } from 'react';
import PerfectScrollbar from 'perfect-scrollbar';
import { Config } from '../../../../shared/config';
import type { ConfigTable, ConfigCategory } from'../../../../@types/hyper'

import '../../../style/index.css';
import '../../../style/settings.module.css';

import Item from './item';

const config = new Config()

type SidebarProps = {
    active: string;
    onChange?: (page: string)=> void;
}
class Sidebar extends Component<SidebarProps> {
    
    generateEntries(category: string) {
     const categoryData = config.data[category] as ConfigCategory

      return Object.keys(categoryData.items).map( entry => {
        const entryData = categoryData.items[entry]
        return <Item active={this.props.active} name={entryData.name} category={category} entry={entry} click={ this.props.onChange } icon={entryData.icon} key={`${categoryData.name}.${entryData.name}`}/>
      })
    }

    generateCategories() {
        return Object.keys(config.data as ConfigTable).map( entry => {
            const category = config.data[entry] as ConfigCategory

            return (
                <>
                    <span className={`text-xs text-white opacity-30 category`} key={`${category.name}`}>{category.name}</span>
                    <ul className={`text-white font-normal mb-5`} key={`${category.name}-${entry}`}>
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
            <div className={`flex flex-row w-2/5 pr-6 h-full overflow-hidden select-none px-5 py-3 relative pb-12`} id={'container'}>
                <nav className={`w-full pb-6`}>
                    <header className={`flex flex-row text-white mb-8`}>
                        <img src={'assets://logo.svg'} className={`w-3`} />
                        <span className={`ml-5 text-md font-light`}>Settings</span>
                    </header>
                    <span className={`text-xs text-white opacity-30 category`}>Hyper</span>
                    <ul className={`text-white font-normal mt-1 mb-5`}>
                        <Item name={'About'} category={'hyper_about'} entry={'special'} click={ this.props.onChange } icon={"Info"} active={this.props.active} key="hyper_about" />
                        <Item name={'Themes'} category={'hyper_themes'} entry={'special'} click={ this.props.onChange } icon={"Tag"} active={this.props.active} key="hyper_themes" />
                        <Item name={'Widgets'} category={'hyper_widgets'} entry={'special'} click={ this.props.onChange } icon={"Box"} active={this.props.active} key="hyper_widgets" />
                    </ul>
                    {this.generateCategories()}
                    {this.props.children}
                    <div className={`spacer pb-6 w-full flex`} />
                </nav>
            </div>
        );
    }
}

export default Sidebar;