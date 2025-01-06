import { AccordionContent } from "@/components/ui/accordion";
import { ConnectionProviderProps } from "@/providers/connections-provider";
import { EditorState } from "@/providers/editor-provider";
import { nodeMapper } from "@/lib/types";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { onContentChange } from "@/lib/editor-utils";
import GoogleFileDetails from "./google-file-details";
import GoogleDriveFiles from "./google-drive-files";
import ActionButton from "./action-button";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import NotionPropertiesSelector from "./notion-properties-selector";
import { useAutoStore } from "@/store";
import { Loader2 } from "lucide-react";
import MultipleSelector from "@/components/ui/multiple-selector";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { chatGPT } from "@/app/(main)/(pages)/connections/_actions/openai-connection";

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

  const { setSlackMessage, setNotionValue, notionProperties, selectedGoogleDriveFile, openai, setOpenai } = useAutoStore();

  // useEffect(() => {
  //   const fetchGoogleDriveFiles = async () => {
  //     setIsLoading(true);
  //     setError(null);

  //     try {
  //       const response = await axios.get(`/api/drive`, {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         // Add withCredentials to ensure cookies are sent
  //         withCredentials: true,
  //       });

  //       if (response.data?.message?.files?.length > 0) {
  //         setFile(response.data.message.files[0]);
  //         toast({
  //           description: "File fetched successfully",
  //           variant: "default",
  //         });
  //       } else {
  //         toast({
  //           description: "No files found in Google Drive",
  //           variant: "default",
  //         });
  //       }
  //     } catch (err) {
  //       const error = err as AxiosError;
  //       const errorMessage =
  //         error.response?.status === 401
  //           ? "Please reconnect your Google Drive account"
  //           : "Failed to fetch files from Google Drive";

  //       setError(errorMessage);
  //       toast({
  //         variant: "destructive",
  //         description: errorMessage,
  //       });

  //       // If we get a 401, we should probably trigger a re-authentication
  //       if (error.response?.status === 401) {
  //         // You might want to implement a function to handle re-authentication
  //         // handleReAuthentication();
  //       }
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   if (title === "Google Drive") {
  //     fetchGoogleDriveFiles();
  //   }
  // }, [title, setFile]);

  // @ts-ignore
  const nodeConnectionType: any = nodeConnection[nodeMapper[title]];
  if (!nodeConnectionType) return <p>Not connected</p>;

  const isConnected =
    title === "Google Drive" || title === "AI"
      ? !nodeConnection.isLoading
      : !!nodeConnectionType[
          `${
            title === "Slack"
              ? "slackAccessToken"
              : title === "Discord"
                ? "webhookURL"
                : title === "Notion"
                  ? "accessToken"
                  : ""
          }`
        ];

  if (!isConnected) return <p>Not connected</p>;

  const handleChatGPT = async () => {
    const fileToUse = selectedGoogleDriveFile ?? undefined;
    const response = await chatGPT(openai.input, fileToUse);
    setOpenai({ ...openai, output: response });
    console.log(response);
  }

  return (
    <AccordionContent>
      <Card>
        {title === "Discord" && (
          <CardHeader>
            <CardTitle>{nodeConnectionType.webhookName}</CardTitle>
            <CardDescription>{nodeConnectionType.guildName}</CardDescription>
          </CardHeader>
        )}
        <div className="flex flex-col gap-3 px-6 py-3 pb-20">
          <p>
            {title === "Notion"
              ? "Values to be stored"
              : title == "Slack"
                ? "Message"
                : ""}
          </p>

          {title === "AI" && (
            <div className="space-y-4">
              {selectedGoogleDriveFile && 
                <span>Selected File: {selectedGoogleDriveFile?.name}</span>
              }
              <div className="flex flex-col w-full gap-2">
                <Label htmlFor="message">Your message</Label>
                <Textarea
                  onChange={(e) => setOpenai({ ...openai, input: e.target.value })}
                  placeholder="Enter your message here"
                  value={openai.input}
                  id="message"
                />
                <Button onClick={handleChatGPT} className="mb-4">Send message</Button>
                <Label htmlFor="output">Repsonse</Label>
                <Textarea 
                  placeholder="Your response"
                  value={openai.output}
                  disabled
                />
              </div>  
              {/* <MultipleSelector
                options={[]} 
                disabled={true}
                value={selectedGoogleDriveFile?.name}
              >

              </MultipleSelector> */}
            </div>
          )}

          {title !== "Google Drive" && title !== "AI" && (
            <Input
              type="text"
              value={nodeConnectionType.content}
              onChange={(event) => {
                onContentChange(nodeConnection, title, event);
                if (title === "Slack") {
                  setSlackMessage(event.target.value);
                }
                if (title === "Notion") {
                  setNotionValue(event.target.value);
                }
              }}
              placeholder={`Enter your ${title} message here`}
            />
          )}

          {title === "Notion" && notionProperties.length > 0 ? (
            <NotionPropertiesSelector
              nodeConnection={nodeConnection}
              onPropertyChange={(property, value) => {
                nodeConnection.setNotionNode((prev: any) => ({
                  ...prev,
                  properties: {
                    ...prev.properties,
                    [property]: value,
                  },
                }));
              }}
            />
          ) : title === "Notion" && notionProperties.length === 0 ? (
            <span>
              Loading properties... <br /> <br /> Add properties to your Notion
              database to use them here if you haven't already
            </span>
          ) : null}

          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading files...</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {!isLoading &&
            !error &&
            JSON.stringify(file) !== "{}" &&
            title !== "Google Drive" && (
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

          {title === "Google Drive" && <GoogleDriveFiles />}

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
