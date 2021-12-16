import React, { useState } from 'react'
import useFetch from "react-fetch-hook"
import {Box, Feather} from 'react-feather'
import PackageItem from '../PackageItem'


type RepoItem = {
  user: string,
  package: string
}
type RepoData = {
  [key: string] : RepoItem[]
}

const Home = () => {
  const [repoType, setRepoType] = useState('widgets')
  //@ts-expect-error -- For real?
  const { isLoading: isLoadingRepository, data: repositoryData, error }: {isLoading: boolean, data: RepoData} = useFetch('https://raw.githubusercontent.com/hyperts/hyperassets/master/communityrepository.json')

  // const [downloadProgress, setDownloadProgress] = useState()

  if (isLoadingRepository) {
    return <>Loading repository data</>
  }

  if (error){
    return  <div className='h-full px-2 mx-2 my-2 overflow-auto text-white rounded-md bg-bg' id="contentwrapper">
      <div className='flex items-center justify-center w-full h-8 px-3 py-6 mb-2 text-red-200 align-middle rounded-md bg-secondary'>
        😔 Unable to reach hyper repositories: <span className='mx-3 text-white'>Check your internet connection</span>
      </div>
    </div>
  }

  return <>
    <div className='flex w-full h-12 text-sm bg-primary'>
      <button 
      className={`flex flex-row items-center px-5 py-1 w-full text-white ${repoType == 'widgets' ?'bg-accent' : 'bg-secondary'} focus:outline-none transition-all duration-300  justify-center`}
      onClick={()=>{
        if (repoType !== 'widgets'){ setRepoType('widgets') }
      }}
      >
        <Box className='mr-3' size={16}/> Widgets
      </button>
      <button 
      className={`flex flex-row items-center px-5 py-1 w-full text-white ${repoType == 'themes' ?'bg-accent' : 'bg-secondary'} focus:outline-none transition-all duration-300 justify-center`}
      onClick={()=>{
        if (repoType !== 'themes'){ setRepoType('themes') }
      }}
      >
        <Feather className='mr-3' size={16}/> Themes
      </button>
    </div>
    <div className='h-full px-2 mx-2 my-2 overflow-auto text-white rounded-md bg-bg' id="contentwrapper">
      {
        repositoryData[repoType].map( repo => {
          return <PackageItem 
          user={repo.user} 
          pkg={repo.package} 
          repoType={repoType} 
          onDownload={()=>{
          }}
          key={`${repo.package}.${repo.user}.item`
        }/>
        })
      }
    </div>
  </>
}

export default Home