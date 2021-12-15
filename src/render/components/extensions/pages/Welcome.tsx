import React, {useState} from 'react';
import * as Icon from 'react-feather'
import { ipcRenderer } from 'electron';

const {ChevronLeft, ChevronRight} = Icon

const Pages = [
  {
    icon: 'Box', 
    title: 'Widgets', 
    text: <p>Hyper is modular by core.<br />
  Minimalist by default  and Extensible to the limit.
  <br/><br />
  Everything works around extensions called widgets
  In the next pages you can pick some extensions</p>,
   image: 'assets://welcome_slidewidgets.png',
   color: '#7614F5'
  },
  {
    icon: 'Feather', 
    title: 'Themes', 
    text: <p>Made with only modern CSS, the look can be drastically modified by installing themes.<br />
    <br />
    Themes are injected into every component, making possible to customize absolutely everything.</p>,
   image: 'assets://welcome_slidethemes.png',
   color: '#000'
  },
  {
    icon: 'Zap',
    title: 'Tricks',
    image: 'assets://welcome_slidetricks.png',
    color: '#7614F5',
    text: <p>
      • Hold CTRL and right click anywhere in the bar to show options.<br /><br />
      • Enable DebugMode in settings when editting themes/making widgets.<br /><br />
      • Widgets can have their own window and properties, making hyper infinitely extensible.
    </p>
  }
]

const Welcome = () => {
  const [currentPage, setcurrentPage] = useState(0)
  const pageObj = Pages[currentPage]
  //@ts-ignore
  const Glyph : ElementType = Icon[pageObj.icon]
  return (
    <div className="flex flex-col h-full px-4 py-4 overflow-hidden">
      <div>
        <h1 className="text-lg font-semibold text-white">Welcome to Hyper.</h1>
        <span className="text-sm text-gray-400">Since it's your first time, i have to explain some things to you.</span>
      </div>
      <div className="flex flex-row w-full h-full overflow-hidden transition-all duration-300 rounded-md" style={{backgroundColor: pageObj.color ?? 'black'}}>
        <div className="flex flex-col w-1/2 px-6 py-16 bg-secondary">
          <div className="flex flex-row items-center text-3xl font-semibold text-white"><Glyph size={42} className="mr-4"/>{pageObj.title}</div>
          <div className="mt-16 text-sm text-white">{pageObj.text}</div>
        </div>
        <div className="relative flex w-full h-full text-white" style={
          {
            background: `url(${pageObj.image}) no-repeat center`
          }
        }>
          <div className="absolute -translate-y-1/2 top-1/2 left-4"
            onClick={()=>{
              setcurrentPage(currentPage - 1 <= 0 ? 0 : currentPage - 1)
            }}
          >
            <ChevronLeft size={48} className="text-white transition-colors duration-300 hover:text-black"/>
          </div>
          <div className="absolute -translate-y-1/2 top-1/2 right-4"
            onClick={()=>{
              setcurrentPage(currentPage + 1 > Pages.length - 1 ? Pages.length - 1 : currentPage + 1)
              if (currentPage + 1 > Pages.length - 1 ) {
                ipcRenderer.send('extensionWindowHideTutorial')
              }
            }}
          >
            <ChevronRight size={48}  className="text-white transition-colors duration-300 hover:text-black"/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;