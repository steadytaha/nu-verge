import { db } from "@/lib/db";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    try {
        const SIGNING_SECRET = process.env.SIGNING_SECRET

        if (!SIGNING_SECRET) {
            throw new Error(
              'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
            )
        }
        
        const headerPayload = headers()
        const svix_id = (await headerPayload).get('svix-id')
        const svix_timestamp = (await headerPayload).get('svix-timestamp')
        const svix_signature = (await headerPayload).get('svix-signature')

        if (!svix_id || !svix_timestamp || !svix_signature) {
            return new Response('Error occurred -- no svix headers', {
                status: 400
            })
        }

        const payload = await req.json()
        const body = JSON.stringify(payload)

        const wh = new Webhook(SIGNING_SECRET)

        let evt: WebhookEvent
        try {
            evt = wh.verify(body, {
              'svix-id': svix_id,
              'svix-timestamp': svix_timestamp,
              'svix-signature': svix_signature,
            }) as WebhookEvent
          } catch (err) {
            console.error('Error: Could not verify webhook:', err)
            return new Response('Error: Verification error', {
              status: 400,
            })
          }
        
        const eventType = evt.type
        if (eventType === 'user.created') {
            const { id, email_addresses, username, image_url } = evt.data
            const email = email_addresses[0]?.email_address
        
            if (!id || !email_addresses) {
              return new Response('Error occurred -- missing data', {
                status: 400
              })
            }
        

            await db.user.upsert({
                where: {clerkId: id},
                update: {
                    email,
                    name: username,
                    profilePhoto: image_url,
                },
                create: {
                    clerkId:id,
                    email,
                    name:username || '',
                    profilePhoto: image_url || ''
                },
            })
            return new NextResponse('User updated in database successfully!', {
                status: 200
            })
        }

    } catch (error) {
        console.log('Error updating database: ', error)
        return new NextResponse('Error updating user in database: ', { status: 500 })
    }}