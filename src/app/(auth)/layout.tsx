import React from 'react'

type Props = { children: React.ReactNode }

function Layout({ children }: Props) {
  return (
    <div className='flex items-center justify-center h-screen w-full'>
        {children}
    </div>
  )
}

export default Layout