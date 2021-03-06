import React from "react"
import {X} from 'react-feather'

import {ipcRenderer} from 'electron'

let animationId: number;
let mouseX: number;
let mouseY: number;

function onMouseDown(e: any) {
  mouseX = e.clientX;  
  mouseY = e.clientY;

  document.addEventListener('mouseup', onMouseUp)
  requestAnimationFrame(moveWindow);
}

function onMouseUp(e: any) {
  ipcRenderer.send('windowMoved');
  document.removeEventListener('mouseup', onMouseUp)
  cancelAnimationFrame(animationId)
}

function moveWindow() {
  ipcRenderer.send('moveSettingsWindow', { mouseX, mouseY });
  animationId = requestAnimationFrame(moveWindow);
}

function Titlebar() {
    return <>
        <div 
          className={`
            flex items-center fixed 
            titlebar
            w-full m-0 z-50 m-t-2
            py-3
            px-3
          `}
          onMouseDown={onMouseDown}
        >
          <X 
            className={`
              text-gray-700 
              cursor-pointer
              px-1 py-1 ml-auto rounded-full
              hover:bg-black hover:text-white 
              transition-all duration-300
              `} 
            size={24}
            onClick={ ()=>{ ipcRenderer.send('closeSettings') } }
          />

        </div>
    </>
}

export default Titlebar