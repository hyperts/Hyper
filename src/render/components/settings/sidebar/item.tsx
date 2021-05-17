import React, { ElementType } from 'react';

import * as Icon from 'react-feather';

type ItemProps = {
    name: string,
    path: string,
    active?: string,
    click?: (path: string, name: string)=> void,
    icon: string,
    key?: string
}

function Item( {name, click, active, icon, path} : ItemProps) {
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
                ${path === active ? 'bg-accent px-2 rounded-md text-bg font-bold' : 'text-gray-200'}
            `}
            key={name}
            onClick={()=>{
                console.log("Clicked", name)
                if (click) { click(path, name) }
            }}
        >
            <Glyph size={16} strokeWidth={path === active? 3 : 2} className={`mr-3`} key/>
            {name}
        </li>
    </>
}

export default Item