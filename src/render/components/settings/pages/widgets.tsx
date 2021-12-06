// TODO: Allow widget creators to pick icon and/or image.

import React, { useState } from 'react';
import Dropzone from '../dropZone';
import * as Icon from 'react-feather';
import WidgetRepository from './../../../../shared/widget'

interface WidgetPageProps {
    change?: () => void;
}

function Widgets(props: WidgetPageProps) {
    const [loading, setLoading] = useState(false)
    const defaultImage = "https://i.imgur.com/vccRW0H.png"
    const DetectedWidgets = new WidgetRepository()
    DetectedWidgets.loadWidgetsInPaths(true)

    // //@ts-ignore
    // const Glyph : ElementType = Icon[icon]

    return <main className="flex flex-col w-full h-full overflow-y-auto text-white">
        <div className={`mb-4 text-white`}>
            <h3 className={`text-2xl text-bold flex flex-row items-center`}><Icon.Box size={22} className={`mr-3`} /> Installed widgets</h3>
            <p className={`text-xs mt-1 font-light text-gray-300`}>This list contains your installed and detected widgets</p>
            {DetectedWidgets.loadedWidgets.map(widget => {
                if (!widget) { return }
                return <div className="flex flex-row items-center justify-center h-20 my-2 align-middle rounded-md select-none bg-secondary">
                    <img src={widget.image ?? defaultImage} className='w-20 mr-3 rounded-l-md' draggable={false} />
                    {/* <div id={`widget.${widget.name}.picture`}/>
                    <style>
                    {`
                        #widget.${widget.name}.picture {
                            background-image: url(${widget.image ?? defaultImage});
                            background-size: cover;
                            background-position: center;
                            width: 64px;
                            height: 64px;
                        }
                    `}
                    </style> */}
                    <div className="flex flex-col">
                        <h3 className="flex flex-row items-center font-bold font-md">{widget.name}</h3>
                        <span className="text-sm text-gray-400">{widget.description}</span>
                        <span className="text-xs text-gray-500">{widget.author ?? 'Unknown author'}</span>
                    </div>
                    <div className="ml-auto">
                        {widget.repository &&
                            <button
                                className="px-2 py-2 mr-2 text-white transition-colors duration-300 rounded-md hover:text-blue-400 bg-primary"
                                onClick={() => {
                                }}
                            >
                                <Icon.Globe size={16} />
                            </button>
                        }
                        <button
                            className="px-2 py-2 mr-3 text-white transition-colors duration-300 rounded-md hover:text-red-600 bg-primary"
                            onClick={() => {
                                const widgetRepository = new WidgetRepository()
                                widgetRepository.uninstallWidget(widget, () => {
                                    window.location.reload()
                                    props.change?.()
                                })
                            }}
                        >
                            <Icon.Trash2 size={16} />
                        </button>
                    </div>
                </div>
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