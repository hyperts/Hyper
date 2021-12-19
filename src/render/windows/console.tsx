import React, {useEffect, useRef, useState} from 'react'
import ReactDOM from 'react-dom'
import { ipcRenderer } from 'electron'
import { MessageLevel, MessagePayload } from '../../shared/logger';

import '../style/index.css'

const styles = {
  [MessageLevel.SUCCESS]: {
    color: '#709e70'
  },
  [MessageLevel.INFO]: {
    color: '#A0A4A1'
  },
  [MessageLevel.DEBUG]: {
    color: '#666b6f'
  },
  [MessageLevel.WARN] : {
    color: '#996555'
  },
  [MessageLevel.ERROR]: {
    color: '#8c2b24'
  },
  time: {
    backgroundColor: '#272c29',
    color: '#687D68'
  }
}

const LevelStrings = {
  [MessageLevel.ERROR]: 'Error',
  [MessageLevel.WARN]: 'Warn',
  [MessageLevel.SUCCESS]: 'Success',
  [MessageLevel.DEBUG]: 'Debug',
  [MessageLevel.INFO]: 'Info',
}

const preRenderHistory: any[] = []

ipcRenderer.on('h_logmessage', (e, data) =>{
  const message: MessagePayload = data ?? e
  console.log('Message is here', message)
  preRenderHistory.push(message)
})

function App() {
  const [filter, setFilter]: [any, (item: any)=>void] = useState({})
  const [history] = useState(preRenderHistory)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [selectedLine, setSelectedLine]: [undefined | MessagePayload, any] = useState(undefined)
  const containerEl = useRef(null);

  useEffect(()=>{
    ipcRenderer.send('h_consoleready')
    ipcRenderer.on('h_logmessage', (e, data) =>{
      setLastUpdate(new Date())
    })
  }, [])
  
  useEffect(()=>{
    if (containerEl) {
       
      
       //@ts-expect-error -- Common, do i really need to make typing for you? isn't that obvious?
      containerEl?.current?.addEventListener('DOMNodeInserted', event => {
        const { currentTarget: target } = event;        
        target.scroll({ top: target.scrollHeight, behavior:'smooth' });
        
      });
    }
  })

  function filterDisplay(): any[] {
    let display: any[] = []

    if (Object.keys(filter).length === 0) { display = history }
    else {
      display = history.filter( (item: MessagePayload) => {
        console.log(item.message, item.level, filter.level)
        if (filter.level) { 
          return item.level === filter.level
        }
        if (filter.text && filter.text.trim() !== '') {
          return item.message.toLowerCase().includes(filter.text.toLowerCase()) || item.name.toLowerCase().includes(filter.text.toLowerCase())
        }
        if (filter.name) {
          return item.name.includes(filter.name)
        } 
      })
    }
    return display
  }

  function renderLines() {
    console.log('filter', filter)
    return filterDisplay().map( (line, index) => {
      return <li 
      key={`line.${index}.${line.name}.${line.time}`} 
      className='flex flex-row w-full text-xs transition-colors duration-300 bg-opacity-25 cursor-pointer bg-primary min-h-6 hover:bg-primary hover:bg-opacity-40' 
      style={{marginBottom: '1px'}}
      onClick={()=>{
        if (selectedLine == line) {
          setSelectedLine(undefined)
        } else {
          setSelectedLine(line)
        }
      }}
      >
        <div className='flex justify-center w-32 h-full px-2 text-right' style={styles.time}>
          {line.time.toLocaleTimeString()}
        </div>
        <div className={`flex px-2 w-60 overflow-hidden justify-end bg-opacity-25 h-full  text-right`} style={{backgroundColor: '#34272f', color: '#965373'}}>
          {line.name.toUpperCase()}
        </div>
        <div 
        className={`flex w-full px-2 h-full flex-col`}
        //@ts-ignore
        style={styles[line.level]}
        >
          {line.message.split('\n').map((str: string) => <p>{str}</p>)}
        </div>
      </li>
    })
  }

  return <div className='flex flex-col w-full h-screen bg-navbar'>
    <div className='flex flex-row w-full h-full text-sm text-white border-solid select-none'>
      <div className='flex flex-col w-full px-0.5 py-0.5 mx-1 my-1 bg-bg'>
         <div className='flex flex-col justify-center w-full h-6 px-2 py-2 text-xs font-light text-subtle bg-primary'>Hyper Console - Last update: {lastUpdate.toLocaleTimeString()}</div>
        <div className='flex flex-row w-full h-full overflow-y-hidden' id='output'>
          <ul className='flex flex-col w-full overflow-y-scroll pt-0.5' ref={containerEl}>
            {renderLines()}       
          </ul>
        </div>
        <div className='flex flex-row h-8'>
          <button 
          className='w-10 mr-0.5' 
          style={{...styles[MessageLevel.WARN], backgroundColor:'#2C2520'}} 
          onClick={()=>{
            if (filter.level === MessageLevel.WARN){
              setFilter({})
            } else {
              setFilter({level: MessageLevel.WARN})}
            }
          }>
            {history.filter(line=>{
              return line.level === MessageLevel.WARN
            }).length}
          </button>
          <button className='w-10 mr-0.5' style={{...styles[MessageLevel.ERROR], backgroundColor:'#2A2020'}}onClick={()=>{
            if (filter.level === MessageLevel.ERROR){
              setFilter({})
            } else {
              setFilter({level: MessageLevel.ERROR})}
            }
          }>
          {history.filter(line=>{
              return line.level === MessageLevel.ERROR
            }).length}
          </button>
          <button className='w-10 mr-0.5' style={{...styles[MessageLevel.SUCCESS], backgroundColor:'#202321'}}onClick={()=>{
            if (filter.level === MessageLevel.SUCCESS){
              setFilter({})
            } else {
              setFilter({level: MessageLevel.SUCCESS})}
            }
          }>
          {history.filter(line=>{
              return line.level === MessageLevel.SUCCESS
            }).length}
          </button>
          <button className='w-10 mr-0.5' style={{...styles[MessageLevel.DEBUG], backgroundColor:'#1F2022'}}onClick={()=>{
            if (filter.level === MessageLevel.DEBUG){
              setFilter({})
            } else {
              setFilter({level: MessageLevel.DEBUG})}
            }
          }>
          {history.filter(line=>{
              return line.level === MessageLevel.DEBUG
            }).length}
          </button>
          <button className='w-10 mr-0.5' style={{...styles[MessageLevel.INFO], backgroundColor:'#1F2022'}}onClick={()=>{
            if (filter.level === MessageLevel.INFO){
              setFilter({})
            } else {
              setFilter({level: MessageLevel.INFO})}
            }
          }>
          {history.filter(line=>{
              return line.level === MessageLevel.INFO
            }).length}
          </button>
          <input 
            className='flex w-full h-full px-2 mt-auto bg-secondary mr-0.5' 
            id='input'
            placeholder='Filter...'
            onChange={(e)=>{
              if (e.target.value.trim() === '') {
                setFilter({})
              } else {
                setFilter({
                  ...filter,
                  text: e.target.value.trim()
                })
              }
            }}
          />
        </div>
      </div>
      <div className='flex flex-col w-1/3 px-0.5 py-0.5 mr-1 my-1 bg-bg trasition-all duration-300'>
        <div>
          <span className='flex items-center px-2 py-1 text-sm text-gray-400 uppercase bg-secondary'>Logger</span>
          {/*@ts-expect-error This is internal tooling, i don't give a fuck.*/}
          <div className='flex items-center w-full px-2 py-2 text-xs text-gray-400'>{selectedLine ? selectedLine.name : '-'} </div>
        </div>
        <div>
          <span className='flex items-center px-2 py-1 text-sm text-gray-400 uppercase bg-secondary'>Level</span>
          {/*@ts-expect-error This is internal tooling, i don't give a fuck.*/}
          <div className='flex items-center w-full px-2 py-2 text-xs text-gray-400'>{selectedLine ? LevelStrings[selectedLine.level] : '-'} </div>
        </div>
        <div>
          <span className='flex items-center px-2 py-1 text-sm text-gray-400 uppercase bg-secondary'>Message</span>
          {/*@ts-expect-error This is internal tooling, i don't give a fuck.*/}
          <div className='flex flex-col w-full px-2 py-2 text-xs text-gray-400'>{selectedLine ? selectedLine.message.split('\n').map((str: string) => <p>{str}</p>) : '-'} </div>
        </div>
        <div>
          <span className='flex items-center px-2 py-1 text-sm text-gray-400 uppercase bg-secondary'>Stack</span>
          <div className='flex flex-col w-full overflow-x-hidden overflow-y-scroll text-xs text-gray-400'>{selectedLine 
          /*@ts-expect-error This is internal tooling, i don't give a fuck.*/
            ? selectedLine.stack.map(str=>{
              return <span className='px-2 py-1 mb-2 bg-opacity-25 bg-primary'>{str}</span>
            })
            : '-'
          } 
          </div>
        </div>
      </div>
    </div>
  </div>
}


ReactDOM.render(<App />, document.getElementById('root'))