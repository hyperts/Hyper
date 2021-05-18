import { Config } from '../../../shared/config';
import React from 'react';

import '../../style/input.module.css'

type InputProps = {
    value: any;
    type: string;
    path: string;
    options?: Array<string>;
    change?: () => void;
}

const config = new Config()

function Input({ path, value, type, options, change }: InputProps) {

    function applyChange(newValue: any) {
        config.set(path, newValue, (Err) => console.log)
        config.save(()=>{
            change?.()
        })
    }

    function renderForm() {
        switch (type) {
            case "color":
                break;
            case "text":
                break;
            case "checkbox":
                return <>
                    <label htmlFor={path} className="flex items-center mt-2 cursor-pointer">
                        <div className="relative">
                            <input id={path} type="checkbox" className="hidden" onChange={(e)=>{
                                change?.()
                                applyChange(e.target.checked)
                            }} defaultChecked={value} />
                            <div className="w-12 h-6 rounded-full shadow-inner bg-navbar toggle-path"
                            > </div>
                            <div
                                className="absolute inset-y-0 top-0 left-0 w-5 h-5 rounded-full bg-subtle toggle-circle hover:bg-accent"
                            ></div>
                        </div>
                    </label>
                </>
            case "number":
                return <>
                    <div className="z-0 w-24 mt-2 h-9 custom-number-input">
                        <div className="relative flex flex-row w-full h-full mt-1 bg-transparent rounded-lg">
                            <button
                                className="w-20 h-full text-gray-400 transition-all duration-300 outline-none cursor-pointer rounded-l-md bg-navbar hover:text-white hover:bg-accent"
                                onClick={e => {
                                    const element = document.getElementById(`${path}`)
                                    // @ts-ignore // We need to ignore this, the solution for that is a stupid type swap, which i'm not going to do
                                    let num = Number(element.value);
                                    num--;
                                    // @ts-ignore
                                    element.value = num
                                    applyChange(num)
                                }}
                            >
                                <span className="m-auto text-2xl font-thin">−</span>
                            </button>
                            <input 
                                id={path} 
                                type="number" 
                                className="flex items-center w-full text-center text-white transition-all duration-300 outline-none bg-navbar focus:outline-none text-md hover:text-white focus:text-accent md:text-basecursor-default" name={path} 
                                defaultValue={value} 
                                onChange={(e)=>{
                                    applyChange(Number(e.target.value))
                                }}
                            />
                            <button
                                className="w-20 h-full text-gray-400 transition-all duration-300 cursor-pointer rounded-r-md bg-navbar hover:text-white hover:bg-accent"
                                onClick={e => {
                                    const element = document.getElementById(`${path}`)
                                    //@ts-ignore // I'm not doing type swap, sorry.
                                    let num = Number(element.value);
                                    num++;
                                    // @ts-ignore
                                    element.value = num
                                    applyChange(num)
                                }}
                            >
                                <span className="m-auto text-2xl font-thin">+</span>
                            </button>
                        </div>
                    </div>
                </>
            case "selection":
                return <>
                    <div className="mt-2">
                        <div className="relative inline-block dropdown">
                            <button className="inline-flex items-center px-4 py-2 font-semibold text-white rounded bg-navbar">
                                <span id={path} className="mr-1">{value}</span>
                                <svg className="w-4 h-4 ml-3 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /> </svg>
                            </button>
                            <ul className="absolute hidden w-64 pt-1 text-white dropdown-menu">
                                {Object.keys(options || {}).map(optionKey =>{
                                    if (options) {
                                        //@ts-ignore
                                        const option = options[optionKey]
                                        return <li className=""><a className="block px-4 py-2 whitespace-no-wrap transition-all duration-300 cursor-pointer bg-secondary hover:bg-accent" 
                                        onClick={()=>{
                                            //@ts-ignore // I'm not doing type swap, sorry.
                                            document.getElementById(path)?.innerText = option
                                            applyChange(option)
                                        }}>{option}</a></li>
                                    }
                                })}
                            </ul>
                        </div>

                    </div>
                </>
            default:
                return <div className={`mt-2`}> 😞 Field type not recognized </div>
        }
    }


    return (
        <div className={``}>
            {renderForm()}
        </div>
    );
}

export default Input;