import React from 'react';

import '../../style/input.module.css'

type InputProps = {
    value: any;
    type: string;
    path: string;
    options?: Array<string>;
    change?: () => void;
}

function Input({ path, value, type, options, change }: InputProps) {

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
                        <input id={path} type="checkbox" className="hidden" onChange={change} defaultChecked={value}/>
                        <div className="w-12 h-6 rounded-full shadow-inner bg-navbar toggle-path"
                        > </div>
                        <div
                            className="absolute inset-y-0 top-0 left-0 w-5 h-5 rounded-full bg-subtle toggle-circle hover:bg-accent"
                        ></div>
                    </div>
                </label>
                </>
            case "number":
                break;
            case "selection":
                break;
            default:
                return <div> 😞 Field type not recognized </div>
        }
    }


    return (
        <div className={``}>
            {renderForm()}
        </div>
    );
}

export default Input;