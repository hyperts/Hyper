import React, { useState } from 'react'
import useFetch from "react-fetch-hook"
import {Box, Feather} from 'react-feather'
import PackageItem from '../PackageItem';
// import WidgetRepository from '../../../../shared/widget'


// const widgetRepository = new WidgetRepository()
// widgetRepository.loadWidgetsInPaths(true)

// async function fetchPackageData(author: string, pkg: string) {
//   const promise = new Promise(async (resolve: (data: WidgetInfo) => void, reject) => {

//     try {
//       const result = await axios.get(`https://raw.githubusercontent.com/${author}/${pkg}/master/package.json`)
//       resolve(result.data as WidgetInfo)
//     } catch (err) {
//       reject(err)
//     }

//   })

//   return promise
// }


type RepoData = {
  [key: string] : {
    user: string,
    package: string
  }[]
}

const Home = () => {
  const [repoType, setRepoType] = useState('widgets')
  //@ts-expect-error -- For real?
  const { isLoading: isLoadingRepository, data: repositoryData }: {isLoading: boolean, data: RepoData} = useFetch('https://raw.githubusercontent.com/hyperts/hyperassets/master/communityrepository.json')

  
  if (isLoadingRepository) {
    return <>Loading repository data</>
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
          return <PackageItem user={repo.user} pkg={repo.package} repoType={repoType} key={`${repo.package}.${repo.user}.item`}/>
        })
      }
    </div>
    {/* {JSON.stringify(repositoryData[repoType])} */}
    {/* { contentList.map( (pkgData: any) => {
      return <WidgetItem 
        name={pkgData.name}
        description={pkgData.description}
        image={pkgData.image}
        installed={false}
        author={pkgData.author}
        version={pkgData.version}
        install={()=>{
          console.log("Installed")
        }}
        key={`${repoType}.${pkgData.name}.component`}
      />
    })} */}
  </>
};

export default Home;