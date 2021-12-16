import React, { useState } from 'react'
import Axios from 'axios'
import {createWriteStream} from 'fs'
import ProgressRing from '../ProgressRing'
import {Download, Tool} from 'react-feather'

import WidgetRepository from '../../../shared/widget'
import ThemeRepository from '../../../shared/theme'

const widgetRepository = new WidgetRepository()
const themeRepository = new ThemeRepository()

enum DownloadStatus {
  WAITING = 0,
  IN_PROGRESS = 1,
  DONE = 2,
  FAILED = 3,
  ERROR = 4,
  INSTALLING = 5
}

interface Props {
  onFinish: () => void
  onFail?: () => void
  repoType: string
  url: string
  name: string,
  size: number
}

const Downloader = ({onFail, onFinish, url, name, repoType, size}: Props) => {
  const path = repoType == 'widgets' ? widgetRepository.widgetPaths[0] : themeRepository.themesPath[0]

  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState(DownloadStatus.WAITING)

  async function doDownload() {
    
    if (status === DownloadStatus.IN_PROGRESS){ return }
    if (status === DownloadStatus.ERROR){ return }
    if (status === DownloadStatus.INSTALLING){ return }

    if (!url || url === '') {
      setStatus(DownloadStatus.ERROR)
      return
    }

    if (status === DownloadStatus.WAITING) { setStatus(DownloadStatus.IN_PROGRESS) }
    
    console.table({
      url,
      repoType,
      name
    })
    
    const response = await Axios({
      url,
      method: 'GET',
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        const current = progressEvent?.currentTarget?.response.length
        let percentCompleted = Math.floor(current / size * 100)
        setProgress(percentCompleted)
      }
    })

    if (!response){
      setStatus(DownloadStatus.ERROR)
      onFail?.()
    }

    const writer = createWriteStream(`${path}\\${name}.zip`)
    //@ts-expect-error
    const ws = new WritableStream(writer) 
    
    let blob = new Blob([response.data], {type: 'application/zip'})
    const stream =  blob.stream();  

    stream.pipeTo(ws)
    .then(()=>{
      // Now we install & load :D
      setStatus(DownloadStatus.INSTALLING)
      setProgress(100)
      writer.close()
      setTimeout(() => {
        widgetRepository.installWidget(`${path}\\${name}.zip`, ()=>{
          setStatus(DownloadStatus.DONE)
        })
      }, 300);
    })
  }


  doDownload()

  if (status === DownloadStatus.IN_PROGRESS || status === DownloadStatus.INSTALLING) {
    console.log("STATUS:", status, "PROGRESS:", progress)
    return <div className='absolute top-0 left-0 z-50 flex flex-col items-center justify-center w-full h-screen px-16 py-16 text-white opacity-90 bg-bg'>
      <div className='relative'>
        <ProgressRing radius={150} stroke={6} progress={progress}/>
        {status === DownloadStatus.INSTALLING ? <Tool className='absolute top-0 bottom-0 left-0 right-0 m-auto' size={64}/> : <Download className='absolute top-0 bottom-0 left-0 right-0 m-auto' size={64}/> }
      </div>
      <p className='mt-12 text-sm text-gray-200'>{status === DownloadStatus.INSTALLING ? 'Installing' : 'Downloading'} <span className='font-semibold text-white'>{name}</span></p>
    </div>
  }
  return <> </>
};

export default Downloader;