import React, { useState } from 'react';
import useFetch from "react-fetch-hook"
import {DownloadCloud, AlertTriangle, RefreshCcw} from 'react-feather'
import { WidgetInfo } from '../../../shared/widget'
import WidgetRepository from '../../../shared/widget'
import ThemeRepository from '../../../shared/theme'
import Downloader from './Downloader';

const widgetRepository = new WidgetRepository()
const themeRepository = new ThemeRepository()
// Better to fetch everything again, user might have installed manually
widgetRepository.loadWidgetsInPaths() 
themeRepository.loadThemes()
interface Props {
  repoType: "widgets" | "themes" | string // string so we don't have to edit this when expanding for tests
  user: string
  pkg: string
  onDownload: () => void
}

enum InstallStatus {
  NOT_INSTALLED = 0,
  OUTDATED = 1,
  INSTALLED = 2,
  FAILED = 3
}

interface ReleaseInfo {
  assets: [
    {
      url: string,
      name: string,
      label: string | undefined,
      browser_download_url: string,
      size: number
    }
  ]
}

function isInstalled(pkgName: string, pkgVersion: string, pkgType: string): InstallStatus {

  switch(pkgType) {
    case 'widgets': {
      const matches = widgetRepository.loadedWidgets.filter( item => {
        return item.name === pkgName
      })
      if (matches.length > 0) {
        if (Number(matches[0].version) < Number(pkgVersion)) {
          return InstallStatus.OUTDATED
        } else {
          return InstallStatus.INSTALLED
        }
      }

      return InstallStatus.NOT_INSTALLED
    }
    case 'themes': {
      const matches = themeRepository.installedThemes.filter( item => {
        return item.name === pkgName
      })

      if (matches.length > 0) {
        if (Number(matches[0].version) < Number(pkgVersion)) {
          return InstallStatus.OUTDATED
        } else {
          return InstallStatus.INSTALLED
        }
      }

      return InstallStatus.NOT_INSTALLED
    }   
  }

  return InstallStatus.FAILED
}

const PackageList = ({repoType, user, pkg, onDownload}:Props) => {
  const [isDownloading, setDownloading] = useState(false)
  //@ts-expect-error
  const { isLoading, data, error }: {isLoading: boolean, data:WidgetInfo, error:useFetch.UseFetchError} = useFetch(`https://raw.githubusercontent.com/${user}/${pkg}/master/package.json`)
  //@ts-expect-error
  const { isLoading: isLoadingReleases, data: releaseData, error: releaseError }: {isLoading: boolean, data:ReleaseInfo, error:useFetch.UseFetchError} = useFetch(`https://api.github.com/repos/${user}/${pkg}/releases/latest`)

  if (isLoading) {
    return <div className='flex items-center justify-center w-full h-8 px-3 py-6 mb-2 text-green-200 align-middle rounded-md bg-secondary'>
    😁 Loading repository data
  </div>
  }

  if (error) {
    return <div className='flex items-center justify-center w-full h-8 px-3 py-6 mb-2 text-red-200 align-middle rounded-md bg-secondary'>
      😔 Skipping invalid package: <span className='mx-3 text-white'>{user}.{pkg}</span>
    </div>
  }

  const installed = isInstalled(data.name, data.version, repoType)
  
  return <>
   { 
   isDownloading && !isLoadingReleases 
   ? <Downloader onFinish={()=>{}} size={releaseData?.assets[0]?.size} name={data.name} repoType={repoType} url={releaseData?.assets[0]?.browser_download_url}/> 
   : <> </> // Maybe display some package size information in the future?
  }
    <div className='flex w-full h-32 px-2 py-2 mb-2 rounded-md select-none bg-primary'>
      <img src={data.image ?? 'https://i.imgur.com/vccRW0H.png'} className='rounded-md h-30' />
      <div className='flex flex-col w-full h-full py-3 ml-3 items'>
        <h1 className='relative text-2xl font-semibold'>
          {data.name ?? 'Invalid Name'} 
          <span className='absolute ml-1 text-xs text-gray-500 font-regular -top-1'>v{data.version ?? 'Unknown version'} </span>
        </h1>
        <p className='text-sm text-gray-300'>
          {data.description ?? 'No description'}
        </p>
        <p className='relative mt-auto'>
        <span className='ml-1 text-xs text-gray-500 font-regular'>by:</span> {data.author}
          <span className='ml-1 text-xs text-gray-500 font-regular'>/@{user}</span>
        </p>
      </div>
      <div 
      className='flex flex-col items-center justify-center h-full'>
        <button 
        className={`flex flex-row items-center px-4 py-2 transition-colors duration-300 rounded-md 
        ${installed === InstallStatus.NOT_INSTALLED || installed === InstallStatus.OUTDATED
          ? 'bg-secondary text-white' 
        : installed === InstallStatus.INSTALLED
          ? 'bg-navbar text-gray-400 cursor-not-allowed'
        : 'bg-[#CF6679] text-gray-400'
        } 
        ${installed === InstallStatus.INSTALLED || installed === InstallStatus.FAILED
          ? 'cursor-normal hover:bg-bg'
          : 'hover:bg-accent'
        } 
        focus:outline-none`}
        onClick={()=>{
          if(installed === InstallStatus.INSTALLED || installed === InstallStatus.FAILED) { return }
          setDownloading(true)
          onDownload?.()
        }}>
          {installed === InstallStatus.NOT_INSTALLED 
                      ?<DownloadCloud className='mr-2' width={16}/>
          :installed === InstallStatus.FAILED
                      ?<AlertTriangle className='mr-2' width={16}/>
          :installed === InstallStatus.OUTDATED
                      ? <RefreshCcw className='mr-2' width={16}/>
          : <></>
          }
            {installed === InstallStatus.INSTALLED 
                       ? 'Installed'
            :installed === InstallStatus.OUTDATED
                       ? 'Update'
            :installed === InstallStatus.NOT_INSTALLED
                       ? 'Install'
            : 'ERROR'
            }
        </button>
      </div>
    </div>
  </>
}

export default PackageList