'use client'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { onFlowPublish } from '../_actions/workflow-connections'

type Props = {
    name: string
    description: string
    id: string
    publish: boolean | null
}

const Workflow = ({ description, id, name, publish }: Props) => {
    const [isPublish, setIsPublish] = useState<boolean>(publish ?? false)
    
    const onPublishFlow = async (checked: boolean) => {
        try {
            const response = await onFlowPublish(id, checked)
            if (response) {
                toast({
                    description: response
                })
                setIsPublish(checked)
            }
        } catch (error) {
            toast({
                description: 'Failed to update workflow status',
                variant: 'destructive'
            })
        }
    }

    return (
        <Card className='flex w-full items-center justify-between'>
            <CardHeader className='flex flex-col gap-4'>
                <Link href={`/workflows/editor/${id}`}>
                    <div className='flex flex-row gap-2'>
                        <Image
                            src="/googleDrive.png"
                            alt="Google Drive"
                            height={30}
                            width={30}
                            className='object-contain'
                        />
                        <Image
                            src="/notion.png"
                            alt="Notion"
                            height={30}
                            width={30}
                            className='object-contain'
                        />
                        <Image
                            src="/discord.png"
                            alt="Discord"
                            height={30}
                            width={30}
                            className='object-contain'
                        />
                    </div>
                    <div className=''>
                        <CardTitle className='text-lg'>{name}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </Link>
            </CardHeader>
            <div className='flex flex-col items-center gap-2 p-4'>
                <Label 
                    htmlFor='airplane-mode'
                    className='text-muted-foreground'
                >
                    {isPublish ? 'On' : 'Off'}
                </Label>
                <Switch
                    id='airplane-mode'
                    onCheckedChange={onPublishFlow}
                    checked={isPublish}
                />  
            </div>
        </Card>
    )
}

export default Workflow