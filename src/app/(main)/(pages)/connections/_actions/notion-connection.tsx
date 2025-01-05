'use server'
import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import { Client } from '@notionhq/client'

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
      // await addContextToNotionPage(response.id, accessToken, gptResponse)
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

export const addContextToNotionPage = async (pageId: any, accessToken: string, content: string) => {
  const notion = new Client({
    auth: accessToken,
  })

  const response = await notion.blocks.children.append({
    block_id: pageId,
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: content,
              },
            },
          ],
        },
      },
    ],
  })
  return response
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