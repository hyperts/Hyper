import React from 'react';
import * as Icon from 'react-feather';

interface Props {
  image?: string
  name: string
  description: string
  author?: string
  repository?: string
  installed?: boolean
  version?: string
  onClick?: () => void
  uninstall?: () => void
  install?: () => void
}

const WidgetItem = (props: Props) => {
  const defaultImage = "https://i.imgur.com/vccRW0H.png"

  return <>
    <div className="relative flex flex-row items-center justify-center w-full h-24 my-2 align-middle rounded-md select-none bg-primary">
      <img src={props.image ?? defaultImage} className='h-full mr-3 rounded-l-md' draggable={false} />
      <div className="flex flex-col">
        <h3 className="flex flex-row items-center font-bold font-md">{props.name} {props.version && `[${props.version}]`}</h3>
        <span className="text-sm text-gray-400">{props.description}</span>
        <span className="text-xs text-gray-500">{props.author ?? 'Unknown author'}</span>
      </div>
      <div className="flex flex-row ml-auto">
        {props.repository &&
          <a
            className="px-2 py-2 mr-2 text-white transition-colors duration-300 rounded-md hover:text-blue-400 bg-secondary"
            href={props.repository} target="_blank"
          >
            <Icon.Globe size={16} />
          </a>
        }
        {props.installed ? <button
          className="px-2 py-2 mr-3 text-white transition-colors duration-300 rounded-md hover:text-red-600 bg-secondary focus:outline-none"
          onClick={props.uninstall}
        >
          <Icon.Trash2 size={16} />
        </button>
          : <button
            className="px-2 py-2 mr-3 text-white transition-colors duration-300 rounded-md hover:text-green-600 bg-secondary focus:outline-none"
            onClick={props.install}
          >
            <Icon.DownloadCloud size={16} />
          </button>
        }
      </div>
    </div>
  </>;
};

export default WidgetItem;