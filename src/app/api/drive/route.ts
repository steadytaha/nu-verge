import { auth, currentUser } from '@clerk/nextjs/server';
import axios from 'axios';
import { google } from 'googleapis';
import { Readable } from 'stream'
import { NextResponse } from 'next/server';

async function getGoogleAccessToken() {
  try {
    console.log("Starting getGoogleAccessToken...");
    const user = await currentUser();

    if (!user) {
      throw new Error('No user found');
    }

    try {
      async function sendRequest() {
        const url = `https://api.clerk.com/v1/users/${user?.id}/oauth_access_tokens/oauth_google`;
        
        // Headers
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        };
        
        try {
          const response = await axios({
            method: 'get',
            url,
            headers,
          });

          return response;
        } catch (error: any) {
          if (error.response) {
            console.error('Error Response:', error.response.data);
          } else if (error.request) {
            console.error('No Response Received:', error.request);
          } else {
            console.error('Request Setup Error:', error.message);
          }
          return undefined;
        }
      }
      
      const response = await sendRequest();
      if (!response) {
        throw new Error('Failed to retrieve response from sendRequest');
      }
      const token = response.data[0].token;
      
      console.log("Access token obtained:", token ? "Success" : "Failed");
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      throw new Error('Failed to get Google access token');
    }
  } catch (error) {
    console.error('Error in getGoogleAccessToken:', error);
    throw error;
  }
}

export async function getPDFBufferFromGoogleDrive(fileId: string): Promise<Buffer> {
  try {
    const accessToken = await getGoogleAccessToken();
    console.log("Access Token received:", accessToken ? "✅ Success" : "❌ Failed");
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.OAUTH2_REDIRECT_URI
    );
    console.log("OAuth2 Client created:", !!oauth2Client ? "✅ Success" : "❌ Failed");

    oauth2Client.setCredentials({
      access_token: accessToken,
    });
    console.log("Credentials set successfully");
    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    
    const file = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType, name',
    })

    if (file.data.mimeType !== 'application/pdf') {
      throw new Error('The specified file is not a PDF')
    }
    
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: 'media',
      },
      { responseType: 'stream' }
    )
    // Convert stream to buffer
    const buffers: Buffer[] = []
    const stream = response.data as unknown as Readable

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => buffers.push(Buffer.from(chunk)))
      stream.on('end', () => resolve(Buffer.concat(buffers)))
      stream.on('error', (error) => reject(error))
    })
  } catch (error) {
    console.error('Error fetching PDF from Google Drive:', error)
    throw error
  }
}

export async function GET() {
  try {
    console.log("=== START: Drive API Request ===");
    
    // Step 1: Get Access Token
    console.log("Step 1: Getting access token...");
    const accessToken = await getGoogleAccessToken();
    console.log("Access Token received:", accessToken ? "✅ Success" : "❌ Failed");

    // Step 2: Create OAuth2 Client
    console.log("\nStep 2: Creating OAuth2 Client...");
    console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
    console.log("GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);
    console.log("OAUTH2_REDIRECT_URI exists:", !!process.env.OAUTH2_REDIRECT_URI);
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.OAUTH2_REDIRECT_URI
    );
    console.log("OAuth2 Client created:", !!oauth2Client ? "✅ Success" : "❌ Failed");

    // Step 3: Set Credentials
    console.log("\nStep 3: Setting credentials...");
    oauth2Client.setCredentials({
      access_token: accessToken,
    });
    console.log("Credentials set successfully");

    // Step 4: Initialize Drive Client
    console.log("\nStep 4: Creating Drive client...");
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    console.log("Drive client created:", !!drive ? "✅ Success" : "❌ Failed");

    // Step 5: List Files
    console.log("\nStep 5: Fetching files...");
    const response = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType, createdTime)',
    });

    console.log("Response received:", !!response ? "✅ Success" : "❌ Failed");
    console.log("Number of files found:", response.data.files?.length || 0);
    console.log("Files:", JSON.stringify(response.data.files, null, 2));
    
    return NextResponse.json({ 
      message: response.data,
      status: 200 
    });
  } catch (error: any) {
    console.error("=== ERROR IN DRIVE API ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch files',
      details: error.message,
      status: 500 
    });
  }
}