'use client'
import { OperatorType } from '@/lib/types'
import { createContext, useContext, useState } from 'react'

export type ConnectionProviderProps = {
  discordNode: {
    webhookURL: string
    content: string
    webhookName: string
    guildName: string
  }
  setDiscordNode: React.Dispatch<React.SetStateAction<any>>
  googleNode: {}[]
  setGoogleNode: React.Dispatch<React.SetStateAction<any>>
  notionNode: {
    accessToken: string
    databaseId: string
    workspaceName: string
    content: string
  }
  workflowTemplate: {
    discord?: string
    notion?: string
    slack?: string
  }
  setNotionNode: React.Dispatch<React.SetStateAction<any>>
  slackNode: {
    appId: string
    authedUserId: string
    authedUserToken: string
    slackAccessToken: string
    botUserId: string
    teamId: string
    teamName: string
    content: string
  }
  setSlackNode: React.Dispatch<React.SetStateAction<any>>
  setWorkFlowTemplate: React.Dispatch<
    React.SetStateAction<{
      discord?: string
      notion?: string
      slack?: string
    }>
  >
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  notionDetails: any,
  setNotionDetails: React.Dispatch<
  React.SetStateAction<{
    class?: string
    type?: string
    reviewed?: boolean
    }>
  >
  openaiNode: {
    input: string,
    content: string,
  }
  setOpenaiNode: React.Dispatch<React.SetStateAction<any>>
  conditionNode: {
    operator: OperatorType,
    parameter: string,
  },
  setConditionNode: React.Dispatch<React.SetStateAction<any>>
  waitNode: {
    jobDetails: {
      seconds: number,
      minutes: number,
      hours: number,
      type: string
    },
  },
  setWaitNode: React.Dispatch<React.SetStateAction<any>>
}

type ConnectionWithChildProps = {
  children: React.ReactNode
}

const InitialValues: ConnectionProviderProps = {
  discordNode: {
    webhookURL: '',
    content: '',
    webhookName: '',
    guildName: '',
  },
  googleNode: [],
  notionNode: {
    accessToken: '',
    databaseId: '',
    workspaceName: '',
    content: '',
  },
  workflowTemplate: {
    discord: '',
    notion: '',
    slack: '',
  },
  slackNode: {
    appId: '',
    authedUserId: '',
    authedUserToken: '',
    slackAccessToken: '',
    botUserId: '',
    teamId: '',
    teamName: '',
    content: '',
  },
  notionDetails: null,
  isLoading: false,
  openaiNode: {
    input: '',
    content: '',
  },
  conditionNode: {
    operator: "AND",
    parameter: "",
  },
  waitNode: {
    jobDetails: {
      seconds: 0,
      minutes: 0,
      hours: 0,
      type: "",
    },
  },
  setGoogleNode: () => undefined,
  setDiscordNode: () => undefined,
  setNotionNode: () => undefined,
  setSlackNode: () => undefined,
  setOpenaiNode: () => undefined,
  setIsLoading: () => undefined,
  setWorkFlowTemplate: () => undefined,
  setNotionDetails: () => undefined,
  setConditionNode: () => undefined,
  setWaitNode: () => undefined,
}

const ConnectionsContext = createContext(InitialValues)
const { Provider } = ConnectionsContext

export const ConnectionsProvider = ({ children }: ConnectionWithChildProps) => {
  const [discordNode, setDiscordNode] = useState(InitialValues.discordNode)
  const [googleNode, setGoogleNode] = useState(InitialValues.googleNode)
  const [notionNode, setNotionNode] = useState(InitialValues.notionNode)
  const [slackNode, setSlackNode] = useState(InitialValues.slackNode)
  const [isLoading, setIsLoading] = useState(InitialValues.isLoading)
  const [notionDetails, setNotionDetails] = useState(InitialValues.notionDetails)
  const [openaiNode, setOpenaiNode] = useState(InitialValues.openaiNode)
  const [conditionNode, setConditionNode] = useState(InitialValues.conditionNode)
  const [waitNode, setWaitNode] = useState(InitialValues.waitNode)
  const [workflowTemplate, setWorkFlowTemplate] = useState(
    InitialValues.workflowTemplate
  )

  const values = {
    discordNode,
    setDiscordNode,
    googleNode,
    setGoogleNode,
    notionNode,
    setNotionNode,
    slackNode,
    setSlackNode,
    isLoading,
    setIsLoading,
    workflowTemplate,
    setWorkFlowTemplate,
    notionDetails,
    setNotionDetails,
    openaiNode,
    setOpenaiNode,
    conditionNode,
    setConditionNode,
    waitNode,
    setWaitNode
  }

  return <Provider value={values}>{children}</Provider>
}

export const useNodeConnections = () => {
  const nodeConnection = useContext(ConnectionsContext)
  return { nodeConnection }
}

export default ConnectionsProvider