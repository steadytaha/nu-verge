// actionHandlers.ts
import { toast } from "@/hooks/use-toast";
import { ConnectionProviderProps } from "@/providers/connections-provider";
import { Option, useAutoStore } from "@/store";
import { onCreateNewPageInDatabase } from "@/app/(main)/(pages)/connections/_actions/notion-connection";
import { postMessageToSlack } from "@/app/(main)/(pages)/connections/_actions/slack-connection";

export const onStoreNotionContent = async (
  nodeConnection: ConnectionProviderProps
) => {
  const { setNotionValue, setNotionDetails } = useAutoStore.getState();
  const response = await onCreateNewPageInDatabase(
    nodeConnection.notionNode.databaseId,
    nodeConnection.notionNode.accessToken,
    nodeConnection.notionNode.content, //EŞLEŞTİR   
    nodeConnection.notionDetails
  );
  // if (response) {
  //   nodeConnection.setNotionNode((prev: any) => ({
  //     ...prev,
  //     content: "",
  //   }));
  //   setNotionValue("");
  //   setNotionDetails({
  //     class: "",
  //     type: "",
  //     reviewed: false,
  //   });
  // }
  return response;
};

export const onStoreSlackContent = async (
  nodeConnection: ConnectionProviderProps,
  channels: Option[],
  setChannels: (value: Option[]) => void
) => {
  const response = await postMessageToSlack(
    nodeConnection.slackNode.slackAccessToken,
    channels,
    nodeConnection.slackNode.content
  );
  if (response.message == "Success") {
    toast({
      description: "Message sent successfully!",
    });
    // nodeConnection.setSlackNode((prev: any) => ({
    //   ...prev,
    //   content: "",
    // }));
    // setChannels([]);
  } else {
    toast({
      variant: "destructive",
      description: response.message,
    });
  }
  return response;
};