'use server'
import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import { Client } from '@notionhq/client'
import OpenAI from 'openai'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import fs from 'fs/promises'
import { getPDFBufferFromGoogleDrive } from '@/app/api/drive/route'

const client = new OpenAI()

export const onNotionConnect = async (
  access_token: string,
  workspace_id: string,
  workspace_icon: string,
  workspace_name: string,
  database_id: string,
  id: string
) => {
  'use server'
  if (access_token) {
    //check if notion is connected
    const notion_connected = await db.notion.findFirst({
      where: {
        accessToken: access_token,
      },
      include: {
        connections: {
          select: {
            type: true,
          },
        },
      },
    })

    if (!notion_connected) {
      //create connection
      await db.notion.create({
        data: {
          userId: id,
          workspaceIcon: workspace_icon!,
          accessToken: access_token,
          workspaceId: workspace_id!,
          workspaceName: workspace_name!,
          databaseId: database_id,
          connections: {
            create: {
              userId: id,
              type: 'Notion',
            },
          },
        },
      })
    }
  }
}
export const getNotionConnection = async () => {
  const user = await currentUser()
  if (user) {
    const connection = await db.notion.findFirst({
      where: {
        userId: user.id,
      },
    })
    if (connection) {
      return connection
    }
  }
}

type NotionDetails = {
  class?: string,
  type?: string,
  reviewed?: boolean,
}

export const onCreateNewPageInDatabase = async (
  databaseId: string,
  accessToken: string,
  content: string, 
  notionDetails: NotionDetails
) => {
  const notion = new Client({
    auth: accessToken,
  })

  try {
    const response = await notion.pages.create({
      parent: {
        type: 'database_id',
        database_id: databaseId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: content,
              },
            },
          ],
        },
      },
    })

    if (response) {
      // const pageInfo = await getNotionPage(response.id, accessToken)
      // console.log('Page Info:', pageInfo)
      await updateNotionPage(response.id, accessToken, notionDetails)
      // const pdfBuffer = await getPDFBufferFromFile('../DeploymentandMaintenance.pdf')
      const pdfBuffer = await getPDFBufferFromGoogleDrive('1DDAThpH4KiRGe48mC_vyzVcbMI-8tF5Z')
      const gptResponse = await chatGPTWithPDF(
        pdfBuffer,
        "Explain Canary development.",
        {
          maxContextLength: 1000,
          model: "gpt-4o-mini",
          temperature: 0.5,
        }
      )
      console.log('GPT Response:', gptResponse)
      return response
    }
  } catch (error) {
    console.error('Error creating page:', error)
    throw error
  }
}


export const updateNotionPage = async (pageId: string, accessToken: string, notionDetails: NotionDetails) => {
  const notion = new Client({
    auth: accessToken,
  })

  try {
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        'Reviewed': {
          checkbox: notionDetails.reviewed || false,
        },
        'Class': {
          select: { 
            name: notionDetails.class || ''
          }
        },
        'Type': {
          select: { 
            name: notionDetails.type || ''
          }
        },
      },
    });
    
    // Verify the update by retrieving the page
    const updatedPage = await notion.pages.retrieve({ 
      page_id: pageId 
    });
    
    console.log('Page updated successfully:', updatedPage);
    return updatedPage;
  } catch (error) {
    console.error('Error updating Notion page:', error);
    throw error;
  }
}

export const getNotionPage = async (pageId: string, accessToken: string) => {
  const notion = new Client({
    auth: accessToken,
  })

  try {
    const response = await notion.pages.retrieve({ 
      page_id: pageId 
    })
    return response
  } catch (error) {
    console.error('Error retrieving Notion page:', error)
    throw error
  }
}

export const getNotionDatabase = async (databaseId: string, accessToken: string) => {
  const notion = new Client({
    auth: accessToken,
  })

  try {
    const response = await notion.databases.retrieve({ 
      database_id: databaseId 
    })
    
    // You can also query the database contents
    const databaseContent = await notion.databases.query({
      database_id: databaseId,
      // Optional: Add filters, sorts, or pagination
      // page_size: 100,
      // filter: { ... },
      // sorts: [ ... ],
    })

    return {
      metadata: response,
      content: databaseContent
    }
  } catch (error) {
    console.error('Error retrieving Notion database:', error)
    throw error
  }
}

async function getPDFBufferFromFile(filePath: string): Promise<Buffer> {
  try {
    const buffer = await fs.readFile(filePath)
    return buffer
  } catch (error) {
    console.error('Error reading PDF file:', error)
    throw error
  }
}

async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const loader = new PDFLoader(blob)
    const docs = await loader.load()
    return docs.map(doc => doc.pageContent).join('\n')
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw error
  }
}

function createContextAwarePrompt(userQuestion: string, pdfContext: string): string {
  return `Context from PDF:
  ${pdfContext}

  Based on the above context, please answer this question:
  ${userQuestion}`
}

export async function chatGPTWithPDF(
  pdfBuffer: Buffer,
  userQuestion: string,
  options: {
    maxContextLength?: number;
    model?: string;
    temperature?: number;
  } = {}
) {
  try {
    const pdfText = await extractTextFromPDF(pdfBuffer)
    const maxContextLength = options.maxContextLength || 2000
    const truncatedContext = pdfText.slice(0, maxContextLength)
    const contextualPrompt = createContextAwarePrompt(userQuestion, truncatedContext)
    
    const stream = await client.chat.completions.create({
      model: options.model || 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that answers questions based on the provided PDF context. If the answer cannot be found in the context, say so.'
        },
        { 
          role: 'user', 
          content: contextualPrompt 
        }
      ],
      temperature: options.temperature || 0.7,
      stream: true,
    })

    let fullResponse = ''
    for await (const part of stream) {
      const content = part.choices[0]?.delta?.content || ''
      fullResponse += content
      process.stdout.write(content)
    }

    return fullResponse
  } catch (error) {
    console.error('Error in chatGPTWithPDF:', error)
    throw error
  }
}