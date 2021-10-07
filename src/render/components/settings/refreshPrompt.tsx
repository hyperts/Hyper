import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from "framer-motion";
import { refresh } from '../../ipc'

import { RefreshCw, ChevronUp } from 'react-feather';


function refreshPrompt() {
    const [collapsed, setCollapsed] = useState(false)
    const controls = useAnimation()
    const arrowControls = useAnimation()

    const sequence = async () => {
        await controls.start({ y: 0, x: "-50%", transition: { duration: 0 } })
        await controls.start({ y: -60, transition: { duration: .5 } })
        await controls.start({ y: -25, transition: { duration: .3, delay: 2 } })
        setCollapsed(true)
        return await arrowControls.start({ opacity: 100, transition: { duration: .3 } })
    }


    useEffect(() => {
        sequence()
    }, [])

    return <>
        <motion.div
            className={`flex flex-col fixed transform left-2/3 rounded-md bg-primary text-white top-full`}
            animate={controls}
        >
            <motion.div
                className={`flex w-full items-center justify-center ${!collapsed ? 'hidden' : 'relative'} opacity-0 cursor-pointer hover:bg-navbar rounded-t-md transition-all duration-300`}
                onClick={async () => {
                    controls.start({
                        y: !collapsed ? -25 : -60,
                        transition: { duration: .3 }
                    })
                    await arrowControls.start({ height: 2, opacity: !collapsed ? 100 : 0, transition: { duration: .3 } })

                    setCollapsed(!collapsed)
                }}
                animate={arrowControls}
            >
                <ChevronUp />
            </motion.div>
            <div className={`flex flex-row w-full items-center justify-center cursor-pointer`} >
                <p 
                    className={`px-3`}
                >
                        Refresh to apply
                </p>
                <button 
                    className={`py-3 px-3 bg-subtle hover:bg-success rounded-r-md transition-all duration-300 font-normal hover:text-bg hover:font-bold`}
                    onClick={refresh}
                >
                    <RefreshCw />
                </button>
            </div>

        </motion.div>
    </>
}

export default refreshPrompt