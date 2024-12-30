import { postContentToWebHook } from "@/app/(main)/(pages)/connections/_actions/discord-connection";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ConnectionProviderProps } from "@/providers/connections-provider";
import { Option, useAutoStore } from "@/store";
import { usePathname } from "next/navigation";
import React, { useCallback } from "react";
import { onCreateNodeTemplate } from "../../../_actions/workflow-connections";
import { onStoreNotionContent, onStoreSlackContent } from "@/lib/action-handlers";

type Props = {
  currentService: string;
  nodeConnection: ConnectionProviderProps;
  channels?: Option[];
  setChannels?: (value: Option[]) => void;
};

const ActionButton = ({
  currentService,
  nodeConnection,
  channels,
  setChannels,
}: Props) => {
  const pathName = usePathname();
  const onSendDiscordMessage = useCallback(async () => {
    const response = await postContentToWebHook(
      nodeConnection.discordNode.content,
      nodeConnection.discordNode.webhookURL
    );

    if (response.message == "success") {
      nodeConnection.setDiscordNode((prev: any) => ({
        ...prev,
        content: "",
      }));
    }
  }, [nodeConnection.discordNode]);

  const onCreateLocalNodeTemplate = useCallback(async () => {
    if (currentService === "Discord") {
      const response = await onCreateNodeTemplate(
        nodeConnection.discordNode.content,
        currentService,
        pathName.split("/").pop()!
      );

      if (response) {
        toast({
          description: response,
        });
      }
    }

    if (currentService === "Slack") {
      const response = await onCreateNodeTemplate(
        nodeConnection.slackNode.content,
        currentService,
        pathName.split("/").pop()!,
        channels,
        nodeConnection.slackNode.slackAccessToken
      );

      if (response) {
        toast({
          description: response,
        });
      }
    }

    if (currentService === "Notion") {
      const response = await onCreateNodeTemplate(
        JSON.stringify(nodeConnection.notionNode.content),
        currentService,
        pathName.split("/").pop()!,
        []
      );

      if (response) {
        toast({
          description: response,
        });
      }
    }
  }, [nodeConnection, channels]);

  const handleNotionAction = useCallback(async () => {
    await onStoreNotionContent(nodeConnection);
  }, [nodeConnection]);

  const handleSlackAction = useCallback(async () => {
    if (channels && setChannels) {
      await onStoreSlackContent(nodeConnection, channels, setChannels);
    }
  }, [nodeConnection, channels, setChannels]);

  const renderActionButton = () => {
    switch (currentService) {
      case "Discord":
        return (
          <>
            <Button variant="outline" onClick={onSendDiscordMessage}>
              Test Message
            </Button>
            <Button onClick={onCreateLocalNodeTemplate} variant="outline">
              Save Template
            </Button>
          </>
        );

      case "Notion":
        return (
          <>
            <Button variant="outline" onClick={handleNotionAction}>
              Test Message
            </Button>
            <Button onClick={onCreateLocalNodeTemplate} variant="outline">
              Save Template
            </Button>
          </>
        );

      case "Slack":
        return (
          <>
            <Button variant="outline" onClick={handleSlackAction}>
              Test Message
            </Button>
            <Button onClick={onCreateLocalNodeTemplate} variant="outline">
              Save Template
            </Button>
          </>
        );

      default:
        return null;
    }
  };
  return renderActionButton();
};

export default ActionButton;