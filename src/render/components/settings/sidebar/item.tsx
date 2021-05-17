import React, { ElementType } from 'react';

import * as Icon from 'react-feather';

type ItemProps = {
    name: string,
    active?: string,
    click?: (name: string)=> void,
    icon: string,
    key?: string
}

function Item( {name, click, active, icon} : ItemProps) {
    //@ts-ignore
    const Glyph : ElementType = Icon[icon]

    return <>
        <li 
            className={`
                item flex flex-row items-center
                text-sm  hover:text-white 
                py-2 hover:px-2 my-1
                hover:bg-accent 
                rounded-md  
                transition-all duration-300 cursor-pointer 
                ${name === active ? 'bg-accent px-2 rounded-md text-white' : 'text-gray-200'}
            `}
            key={name}
            onClick={()=>{
                console.log("Clicked", name)
                if (click) { click(name) }
            }}
        >
            <Glyph size={16} className={`mr-3`} key/>
            {name}
        </li>
    </>
}

export default Item