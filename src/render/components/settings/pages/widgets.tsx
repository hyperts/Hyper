// TODO: Allow widget creators to pick icon and/or image.

import React, { useState } from 'react';
import Dropzone from '../dropZone';
import * as Icon from 'react-feather';
import WidgetRepository from './../../../../shared/widget'
import WidgetItem from '../../widgets/widgetItem'

interface WidgetPageProps {
    change?: () => void;
}

function Widgets(props: WidgetPageProps) {
    const [loading, setLoading] = useState(false)
    const DetectedWidgets = new WidgetRepository()
    DetectedWidgets.loadWidgetsInPaths()

    // //@ts-ignore
    // const Glyph : ElementType = Icon[icon]

    return <main className="flex flex-col w-full h-full overflow-y-auto text-white">
        <div className={`mb-4 text-white`}>
            <h3 className={`text-2xl text-bold flex flex-row items-center`}><Icon.Box size={22} className={`mr-3`} /> Installed widgets</h3>
            <p className={`text-xs mt-1 font-light text-gray-300`}>This list contains your installed and detected widgets</p>
            {DetectedWidgets.loadedWidgets.map(widget => {
                if (!widget) { return }
                return <WidgetItem 
                    name={widget.name} 
                    description={widget.description} 
                    author={widget.author ?? '???'} 
                    image={widget.image} 
                    installed
                    version={widget.version}
                    repository={widget.repository}
                    uninstall={() => {
                        const widgetRepository = new WidgetRepository()
                        widgetRepository.uninstallWidget(widget, () => {
                            window.location.reload()
                            props.change?.()
                        })}
                    }
                />
            })}
        </div>
        <form className="flex flex-row w-full mt-auto">
            {/* <input type="file" className="hidden" />
            <div className="flex items-center justify-center w-full px-3 py-2 text-lg text-gray-500 border-2 border-dashed rounded-md select-none border-secondary">
                
            </div> */}
            <Dropzone onDrop={(files: File[])=>{
                setLoading(true)
                const widgetRepository = new WidgetRepository()
                widgetRepository.installWidget(files[0].path, ()=>{
                    setLoading(false)
                    props.change?.()
                })
            }}/>
        </form>
        {
            loading && <> </>
        }
    </main>
}

export default Widgets