import { ipcMain, ipcRenderer } from 'electron';
import {Config} from '../shared/config'

export type MessagePayload = {message: string, level: number, name: string, stack: string[], time: Date}

function stringify(message: any[]){
  const messageArray: string[] = []

  message.forEach( str => {
    if (typeof str === 'string') { messageArray.push(str)}
    else { messageArray.push(JSON.stringify(str))}
  })

  return messageArray.join(' ')
}

export class Logger {
  public name: string
  private isRenderer: boolean
  private queue: any[]
  private locked: boolean
  /**
  * Initializes a new logger instance.
  * @param name Identifier of this instance.
  **/
  constructor (name: string) {
    this.name = name
    this.isRenderer = process.type === 'renderer'
    this.queue = []
    this.locked = true
    if (!this.isRenderer) {
      this.listen()
    }
  }
  
  //@ts-ignore
  private send({message, level}: {message: any[], level: MessageLevel}) {

    if (!new Config().getValue('general','misc', "console-window")) {
      return
    }
    const stackLines: string[] = [];
    
    const error = new Error() 
    if (error.stack) {
      (error.stack).split('at ').forEach( (stackLine, index) => {
        if (index < 2) { return }
        stackLines.push(stackLine.trim())
      })
    }

    const data = {
      message: stringify(message),
      level,
      name: this.name,
      stack: stackLines,
      time: new Date()
    }

    if (this.isRenderer) {
      ipcRenderer.send('h_logmessage', data)
    } else {
      const { windows }:{windows: {[key:string]:Electron.BrowserWindow}} = require('../main')

      if (!windows.console) {
        this.queue.push(data)
        const queueChecker = setInterval(()=>{
          console.log("Waiting for console window to be ready!")

          if (windows.console && !this.locked) {clearInterval(queueChecker)} // If it's unlocked, remove the checked and continue.
          else { return } // Otherwise we stop here

          this.queue.forEach( item => {
            windows?.console.webContents.send('h_logmessage', item)
          })
        }, 100)

        return
      }

      windows?.console.webContents.send('h_logmessage', data)
    }
  } 

  private listen() {
    ipcMain.on('h_consoleready', ()=> {
      this.locked = false
    })
  }

  public info(...args: any[]) {
    this.send({
      message: args,
      level: MessageLevel.INFO
    })
  }

  public warn(...args: any[]) {
    this.send({
      message: args,
      level: MessageLevel.WARN,
    })
  }

  public error(...args: any[]) {
    this.send({
      message: args,
      level: MessageLevel.ERROR
    })
  }

  public silly(...args: any[]) {
    this.send({
      message: args,
      level: MessageLevel.DEBUG,
    })
  }

  public debug(...args: any[]) {
    this.send({
      message: args,
      level: MessageLevel.DEBUG,
    })
  }

  public success(...args: any[]) {
    this.send({
      message: args,
      level: MessageLevel.SUCCESS,
    })
  }
}

export enum MessageLevel {
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  SUCCESS = 5
}

