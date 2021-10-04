import React, { ElementType } from 'react';
import { Config } from '../../../../shared/config';
import * as Icon from 'react-feather';

import Input from '../input';

type PageProps = {
    path: string,
    change?: () => void;
}

function ConfigPage( {path, change}: PageProps ) {
    const config = new Config(path)
    
    function generateFields(fields: object) {

        return Object.keys(fields).map( (field: string)=>{
            const fieldData = config.get(`fields.${field}`)

            return <>
                <div className={`mt-8`}>
                    <h4 className={`font-bold`}> {fieldData.name} </h4>
                    <p className={`text-xs text-gray-400`}> {fieldData.description} </p>
                    <Input path={`${path}.fields.${field}`} type={fieldData.type} value={fieldData.value} change={change} options={fieldData.options}/>
                </div>
            </>
        })
    }

    function generateEntry() {
        const name = config.data.name
        const description = config.data?.description || 'Missing description'
        const fields = config.data?.fields
        //@ts-ignore
        const Glyph : ElementType = Icon[config.data.icon]

        if (!fields) {
            return <>
                <div className={`w-full h-full flex relative items-center align-middle justify-items-center`}>
                    <div className={`flex flex-col w-full relative text-center`}>
                        <div className="cloudWrap">
                            <div className="lightningBolt"></div>   
                        </div>
                        <h3 className={`text-white text-xl`}>🤷‍♂️ There's nothing here</h3>
                        <p className={`text-error text-sm`}>There's no fields for this config page</p>
                    </div>
                </div>
            </>
        }
        return <>
            <div className={`mb-4 text-white`}>
                <h3 className={`text-2xl text-bold flex flex-row items-center`}><Glyph size={22} className={`mr-3`} key/> {name}</h3>
                <p className={`text-xs mt-1 font-light text-gray-300`}>{description}</p>
                <div className={`flex flex-col w-full mt-2`}>
                    {generateFields(fields)}
                </div>
            </div>
        </>
    }

    if (!config.data) {
        return <>
            <div className={`w-full h-full flex relative items-center align-middle justify-items-center`}>
                <div className={`flex flex-col w-full relative text-center`}>
                    <div className="cloudWrap">
                        <div className="lightningBolt"></div>   
                    </div>
                    <h3 className={`text-white text-xl`}>😭 Oh, my...</h3>
                    <p className={`text-error text-sm`}>This config page is invalid, call the devs</p>
                </div>
            </div>
        </>
    }

    return <>
        {generateEntry()}
    </>
}

export default ConfigPage