import ProfileForm from '@/components/forms/profile-form'
import React from 'react'
import ProfilePicture from './_components/profile-picture'
import { db } from '@/lib/db'
import { currentUser, auth } from '@clerk/nextjs/server'

type Props = {}

const Settings = async (props: Props) => {
    const { userId, redirectToSignIn } = await auth()
    if (!userId) return redirectToSignIn()

    const user = await db.user.findUnique({ where: { clerkId: userId } })

    const removeProfilePicture = async () => {
        'use server'
        const response = await db.user.update({
            where: {
                clerkId: userId,
            },
            data: {
                profilePhoto: '',
            },
        })
        return response
    }

    const uploadProfilePicture = async (image: string) => {
        'use server'
        const response = await db.user.update({
            where: {
                clerkId: userId,
            },
            data: {
                profilePhoto: image
            }
        })
        return response
    }

    const updateUserInfo = async (name: string) => {
        'use server'
        const response = await db.user.update({
            where: {
                clerkId: userId,
            },
            data: {
                name,
            }
        })
        return response
    }

    return (
    <div className='flex flex-col gap-4'>
        <h1 className='sticky top-0 z-[10] flex items-center justify-between border-b bg-background/50 p-6 text-4xl backdrop-blur-lg'>
            <span>Settings</span>
        </h1>
        <div className='flex flex-col gap-10 p-6'>
            <div>
                <h2 className='text-2xl font-bold'>User Profile</h2>
                <p className='text-base text-white/50'>
                    Add or update your information
                </p>
            </div>
            <ProfilePicture
                onDelete={removeProfilePicture}
                profilePhoto={user?.profilePhoto || ''}
                onUpload={uploadProfilePicture}
            />
            <ProfileForm
                user={user}
                onUpdate={updateUserInfo}
            />
        </div>
    </div>
  )
}

export default Settings