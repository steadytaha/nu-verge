import { AccordionContent } from '@/components/ui/accordion';
import { ConnectionProviderProps } from '@/providers/connections-provider';
import { EditorState } from '@/providers/editor-provider';
import { nodeMapper } from '@/lib/types';
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { onContentChange } from '@/lib/editor-utils';
import GoogleFileDetails from './google-file-details';
import GoogleDriveFiles from './google-drive-files';
import ActionButton from './action-button';
import axios, { AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';
import NotionPropertiesSelector from './notion-properties-selector';

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  fixed?: boolean;
  [key: string]: string | boolean | undefined;
}

interface GroupOption {
  [key: string]: Option[];
}

type Props = {
  nodeConnection: ConnectionProviderProps;
  newState: EditorState;
  file: any;
  setFile: (file: any) => void;
  selectedSlackChannels: Option[];
  setSelectedSlackChannels: (value: Option[]) => void;
};

const ContentBasedOnTitle = ({
  nodeConnection,
  newState,
  file,
  setFile,
  selectedSlackChannels,
  setSelectedSlackChannels,
}: Props) => {
  const { selectedNode } = newState.editor;
  const title = selectedNode.data.title;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoogleDriveFiles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/api/drive`, {
          headers: {
            'Content-Type': 'application/json',
          },
          // Add withCredentials to ensure cookies are sent
          withCredentials: true
        });

        if (response.data?.message?.files?.length > 0) {
          setFile(response.data.message.files[0]);
          toast({
            description: "File fetched successfully",
            variant: 'default'
          });
        } else {
          toast({
            description: "No files found in Google Drive",
            variant: 'default'
          });
        }
      } catch (err) {
        const error = err as AxiosError;
        const errorMessage = error.response?.status === 401 
          ? "Please reconnect your Google Drive account"
          : "Failed to fetch files from Google Drive";
        
        setError(errorMessage);
        toast({
          variant: 'destructive',
          description: errorMessage
        });

        // If we get a 401, we should probably trigger a re-authentication
        if (error.response?.status === 401) {
          // You might want to implement a function to handle re-authentication
          // handleReAuthentication();
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (title === 'Google Drive') {
      fetchGoogleDriveFiles();
    }
  }, [title, setFile]);

  // @ts-ignore
  const nodeConnectionType: any = nodeConnection[nodeMapper[title]];
  if (!nodeConnectionType) return <p>Not connected</p>;

  const isConnected =
    title === 'Google Drive'
      ? !nodeConnection.isLoading
      : !!nodeConnectionType[
          `${
            title === 'Slack'
              ? 'slackAccessToken'
              : title === 'Discord'
              ? 'webhookURL'
              : title === 'Notion'
              ? 'accessToken'
              : ''
          }`
        ];

  if (!isConnected) return <p>Not connected</p>;

  return (
    <AccordionContent>
      <Card>
        {title === 'Discord' && (
          <CardHeader>
            <CardTitle>{nodeConnectionType.webhookName}</CardTitle>
            <CardDescription>{nodeConnectionType.guildName}</CardDescription>
          </CardHeader>
        )}
        <div className="flex flex-col gap-3 px-6 py-3 pb-20">
          <p>{title === 'Notion' ? 'Values to be stored' : 'Message'}</p>

          <Input
            type="text"
            value={nodeConnectionType.content}
            onChange={(event) => onContentChange(nodeConnection, title, event)}
            placeholder=''
          />

          {title === 'Notion' && (
            <NotionPropertiesSelector
              nodeConnection={nodeConnection}
              onPropertyChange={(property, value) => {
                nodeConnection.setNotionNode((prev: any) => ({
                  ...prev,
                  properties: {
                    ...prev.properties,
                    [property]: value
                  }
                }))
              }}
            />
          )}

          {isLoading && <p className="text-sm text-muted-foreground">Loading files...</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {!isLoading && !error && JSON.stringify(file) !== '{}' && title !== 'Google Drive' && (
            <Card className="w-full">
              <CardContent className="px-2 py-3">
                <div className="flex flex-col gap-4">
                  <CardDescription>Drive File</CardDescription>
                  <div className="flex flex-wrap gap-2">
                    <GoogleFileDetails
                      nodeConnection={nodeConnection}
                      title={title}
                      gFile={file}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {title === 'Google Drive' && <GoogleDriveFiles />}
          
          <ActionButton
            currentService={title}
            nodeConnection={nodeConnection}
            channels={selectedSlackChannels}
            setChannels={setSelectedSlackChannels}
          />
        </div>
      </Card>
    </AccordionContent>
  );
};

export default ContentBasedOnTitle;