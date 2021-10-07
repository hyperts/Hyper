import React, { ElementType } from 'react';

import * as Icon from 'react-feather';

type ItemProps = {
    name: string,
    category: string,
    entry: string,
    active?: string,
    click?: (category: string)=> void,
    icon: string,
    key?: string
}

function Item( {name, click, active, icon, category, entry } : ItemProps) {
    console.log("ITEM.JSX Name :: ", name, " ACTIVE :: ", active, " CATEGORY ::", category)

    //@ts-ignore
    const Glyph : ElementType = Icon[icon]
    return <>
        <li 
            className={`
                item flex flex-row items-center
                text-sm  hover:text-white 
                py-2 hover:px-2 my-1
                hover:bg-accent 
                rounded-md font-normal
                transition-all duration-300 cursor-pointer 
                ${active === category + '.' + entry ? 'bg-accent px-2 rounded-md text-white font-bold' : 'text-gray-200'}
            `}
            key={name}
            onClick={()=>{
                console.log("Clicked", name)
                if (click) { click(`${category}.${entry}`) }
            }}
        >
            <Glyph size={16} strokeWidth={active ===  category + '.' + entry ? 3 : 2} className={`mr-3`} key/>
            {name}
        </li>
    </>
}

export default Item