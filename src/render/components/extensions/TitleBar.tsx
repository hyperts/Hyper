import React from 'react';
import {X} from 'react-feather'
import {ipcRenderer} from 'electron'

interface Props {
  title: string
}

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
  ipcRenderer.send('moveExtensionWindow', { mouseX, mouseY });
  animationId = requestAnimationFrame(moveWindow);
}

const TitleBar = (props: Props) => {
  return (
    <div className="flex items-center w-full h-12 px-6 py-2 bg-navbar" onMouseDown={onMouseDown}>
      <div className="flex w-8 h-full border-r border-gray-600 itemx-center">
        <img src="assets://logo.svg" className="w-3"/>
      </div>
      <div className="flex items-center w-full h-full ml-6 text-white font-regular">
        {props.title}
      </div>
      <div className="flex items-center h-full">
        <X className="text-gray-600 transition-colors duration-300 hover:text-white" onClick={()=>{
          ipcRenderer.send('closeExtensionWindow')
        }}/>
      </div>
    </div>
  );
};

export default TitleBar;