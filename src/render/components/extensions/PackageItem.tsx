import React from 'react';
import useFetch from "react-fetch-hook"
import {DownloadCloud} from 'react-feather'
import { WidgetInfo } from '../../../shared/widget';


interface Props {
  repoType: "widgets" | "themes" | string // string so we don't have to edit this when expanding for tests
  user: string
  pkg: string
}

const PackageList = ({repoType, user, pkg}:Props) => {
  //@ts-expect-error
  const { isLoading, data, error }: {isLoading: boolean, data:WidgetInfo, error:useFetch.UseFetchError} = useFetch(`https://raw.githubusercontent.com/${user}/${pkg}/master/package.json`)

  if (isLoading) {
    return <> Loading as fuck </>
  }
  if (error) {
    return <div className='flex items-center justify-center w-full h-8 px-3 py-6 mb-2 text-red-200 align-middle rounded-md bg-secondary'>
      😔 Skipping invalid package: <span className='mx-3 text-white'>{user}.{pkg}</span>
    </div>
  }
  return (
    <div className='flex w-full h-32 px-2 py-2 mb-2 rounded-md bg-primary'>
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
          <span className='ml-1 text-xs text-gray-500 font-regular'>/{user}</span>
        </p>
      </div>
      <div className='flex flex-col items-center justify-center h-full'>
        <button className='flex flex-row items-center px-4 py-2 transition-colors duration-300 rounded-md bg-secondary hover:bg-accent focus:outline-none'><DownloadCloud className='mr-3'/> Install</button>
      </div>
    </div>
  );
};

export default PackageList;