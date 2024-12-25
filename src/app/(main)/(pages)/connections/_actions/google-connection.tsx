'use server'
import { auth } from '@clerk/nextjs/server'
import { google } from 'googleapis'

export const getFileMetaData = async () => {
  'use server'
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.OAUTH2_REDIRECT_URI
  )

  const { userId, getToken } = await auth()

  if (!userId) {
    return { message: 'User not found' }
  }

  const accessToken = await getToken({
    template: 'oauth_google'
  })

  oauth2Client.setCredentials({
    access_token: accessToken,
  })

  const drive = google.drive({ version: 'v3', auth: oauth2Client })
  const response = await drive.files.list()

  if (response) {
    return response.data
  }
}