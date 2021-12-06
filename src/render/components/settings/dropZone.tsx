import React, {useCallback, useMemo} from 'react';
import {useDropzone} from 'react-dropzone';
import { Upload } from 'react-feather';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 6,
  borderColor: '#272727',
  borderStyle: 'dashed',
  backgroundColor: '#212121',
  outline: 'none',
  transition: 'all .24s ease-in-out',
  color: 'rgb(107, 114, 128)'
};

const activeStyle = {
  borderColor: '#212121',
  color: '#ffffff'
};

const acceptStyle = {
  borderColor: '#1FDC98',
  color: '#ffffff'
};

const rejectStyle = {
  borderColor: '#CF6679'
};

interface UploadInterfaceProps {
  onDrop: (files: File[]) => void;
}

function StyledDropzone(props: UploadInterfaceProps) {
  
  const onDrop = useCallback((files: File[]) => {
    props.onDrop(files)
  }, [])


  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
      accept: 'zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed',
      onDrop,
      maxFiles: 1
  });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject,
    isDragAccept
  ]);

  return (
    <div className="container">
     {/*@ts-expect-error */}
      <div {...getRootProps({style})}>
        <input {...getInputProps()} />
       {
         isDragAccept ?
         <p className="flex flex-row"><Upload size={22} className="mr-3" /> ⚡ Drop it!</p>:
          <p className="flex flex-row"><Upload size={22} className="mr-3" /> Drop/click to install (ZIP only)</p>
       } 
      </div>
    </div>
  );
}

export default StyledDropzone