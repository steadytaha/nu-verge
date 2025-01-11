import { toast } from "@/hooks/use-toast";
import { onStoreSlackContent, onStoreNotionContent } from "@/lib/action-handlers";
import { chatGPT } from "@/app/(main)/(pages)/connections/_actions/openai-connection";
import { addContextToNotionPage } from "@/app/(main)/(pages)/connections/_actions/notion-connection";
import { getCondition } from "@/lib/editor-canvas-helper";
import { useAutoStore } from "@/store";
import axios from "axios";
import { getUserId } from "@/app/(main)/(pages)/connections/_actions/get-user";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const chargeCredit = async (setCredits: (fn: (prev: string) => string) => void) => {
  const userId = await getUserId();
  try {
    await axios.post(
      `https://localhost:3000/api/drive-activity/notification`,
      null,
      {
        headers: {
          "user-id": userId,
        },
      }
    );
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  } finally {
    setCredits((prevCredits) => (Number(prevCredits) - 1).toString());
  }
};

export const runWorkflow = async (
  nodes: any[],
  nodeConnection: any,
  credits: string | number,
  setCredits: (fn: (prev: string) => string) => void
) => {
  const {
    currentIndex,
    setCurrentIndex,
    openai,
    setOpenai,
    selectedGoogleDriveFile,
    selectedSlackChannels,
    setSelectedSlackChannels,
    conditionNode,
  } = useAutoStore.getState();

  const filteredNodes = nodes.filter(
    (node) => node.type !== "Trigger" && node.type !== "Google Drive" && node.type !== "Wait"
  );

  if (Number(credits) <= 0 && credits !== "Unlimited") {
    setCurrentIndex(null);
    toast({
      variant: "destructive",
      title: "Not enough credits",
      description: "You need to have at least 1 credit to run the workflow",
    });
    return;
  }

  try {
    let lastNodeOutput = "";

    setCurrentIndex(0);
    await delay(500);
  
    for (let i = 0; i < filteredNodes.length; i++) {
   
      const node = filteredNodes[i];
  
      setCurrentIndex(i+1);
    

      let response;

      switch (node.type) {
        case "Slack":
          response = await onStoreSlackContent(
            {
              ...nodeConnection,
              slackNode: {
                ...nodeConnection.slackNode,
                content: lastNodeOutput || nodeConnection.slackNode.content,
              },
            },
            selectedSlackChannels,
            setSelectedSlackChannels
          );
          break;

        case "Notion":
          response = await onStoreNotionContent(nodeConnection);
          if (lastNodeOutput) {
            await addContextToNotionPage(
              response?.id,
              nodeConnection.notionNode.accessToken,
              lastNodeOutput
            );
          }
          break;

        case "AI":
          if (!openai.input) {
            setCurrentIndex(null);
            throw new Error("AI input is required");
          }
          const aiResponse = await chatGPT(openai.input, selectedGoogleDriveFile);
          setOpenai({ ...openai, output: aiResponse });
          lastNodeOutput = aiResponse;
          continue;

        case "Condition":
          setCurrentIndex(++i);

          await delay(500);

          const conditionResult = getCondition(
            conditionNode.operator,
            lastNodeOutput,
            conditionNode.parameter
          );

          const resultNodeType = conditionResult
            ? conditionNode.trueValue
            : conditionNode.falseValue;

          const resultNodeIndex = filteredNodes.findIndex(
            (n) => n.type === resultNodeType
          );
         
          if (resultNodeIndex !== -1) {
            setCurrentIndex(resultNodeIndex+1);
            // await delay(500);

            const resultNode = filteredNodes[resultNodeIndex];
            if (resultNode.type === "Slack") {
              response = await onStoreSlackContent(
                {
                  ...nodeConnection,
                  slackNode: {
                    ...nodeConnection.slackNode,
                    content: lastNodeOutput || nodeConnection.slackNode.content,
                  },
                },
                selectedSlackChannels,
                setSelectedSlackChannels
              );
            } else if (resultNode.type === "Notion") {
              response = await onStoreNotionContent(nodeConnection);
              if (lastNodeOutput) {
                await addContextToNotionPage(
                  response?.id,
                  nodeConnection.notionNode.accessToken,
                  lastNodeOutput
                );
              }
            }
          }

          i ++;
          continue;

        default:
          break;
      }

      if (!response || ("message" in response && response.message !== "Success")) {
        setCurrentIndex(null);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: `Failed to process ${node.type} node`,
        });
        return;
      }

      lastNodeOutput =
        node.type === "Slack" || node.type === "Notion"
          ? openai.output
          : lastNodeOutput;
    }

    await chargeCredit(setCredits);
    
    setTimeout(() => {
      setCurrentIndex(null);
    }, 5000);

    toast({
      title: "Success",
      description: "Workflow executed successfully",
    });
  } catch (error) {
    setCurrentIndex(null);
    toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong.",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};