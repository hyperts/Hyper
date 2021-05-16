import React from "react"
import { Config } from '../../../../shared/config';

import Item from './item'
import '../../style/sidebar.module.css';

const config = new Config();

interface SidebarProps {
    onChange: (active: string)=> void;
    active: string;
}

interface SidebarStates {

}

class Sidebar extends React.Component<SidebarProps, SidebarStates> {
    constructor(props) {
        super(props)

    }

    private renderCategories() {
        const categoryList = config.getAll()

        return categoryList.map( (config)=>{
            return <>
                <span className={`text-xs text-white opacity-30 category`} >{config.name}</span>
                <ul className={`text-white font-normal mt-3`}>
                    {config.items.map( (item)=>{
                        return <Item icon={item.icon} name={item.name} active={this.props.active} click={this.props.onChange} key={item.name} />
                    })}
                </ul>
            </>
        })
    }

    handlePage(item) {

    }

    generateNavigation(object) {

    }

    componentDidMount() {
        this.props.onChange(this.props.active)
    }

    render() {
        return <>
            <nav className={`w-1/3 px-4 py-2 sidebar select-none`}>
                <header className={`flex flex-row text-white mb-6`}>
                    <img src={'assets://logo.svg'} className={`w-3`} />
                    <span className={`ml-5 text-md font-light`}>Settings</span>
                </header>
                <span className={`text-xs text-white opacity-30 category`}>Hyper</span>
                <ul className={`text-white font-normal mt-3`}>
                    <Item icon={'Info'} name={'About'} active={this.props.active} click={this.props.onChange} key={'About'}/>
                    <Item icon={'Tag'} name={'Themes'} active={this.props.active} click={this.props.onChange} key={'Themes'}/>
                    <Item icon={'Box'} name={'Widgets'} active={this.props.active} click={this.props.onChange} key={'Widgets'}/>
                </ul>   
                {this.renderCategories()}
            </nav>
        </>
    }

    componentWillUnmount() {

    }
}


export default Sidebar