'use client'
import React, { useEffect } from 'react'
import { FileUploaderRegular } from '@uploadcare/react-uploader/next';
import '@uploadcare/react-uploader/core.css';
import { useRouter } from 'next/navigation';

type Props = {
    onUpload: (e: string) => any
}

const UploadCareButton = ({ onUpload }: Props) => {
    const router = useRouter()

    useEffect(() => {
        const handleUpload = async (e: any) => {
            const file = await onUpload(e.detail.cdnUrl)
            if(file){
                router.refresh()
            }
        }
    }, [])

  return (
    <div>
      <FileUploaderRegular
         sourceList="local, url, camera, gphotos"
         classNameUploader="uc-dark uc-purple"
         pubkey="d94ab5fa54edd3c3b949"
      />
    </div>
  )
}

export default UploadCareButton