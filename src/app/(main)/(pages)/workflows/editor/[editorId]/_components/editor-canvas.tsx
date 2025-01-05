"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  MiniMap,
  NodeChange,
  ReactFlow,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { EditorCanvasCardType, EditorNodeType } from "@/lib/types";
import { useEditor } from "@/providers/editor-provider";
import EditorCanvasCardSingle from "./editor-canvas-card-single";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { EditorCanvasDefaultCardTypes } from "@/lib/constant";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";
import { v4 } from "uuid";
import FlowInstance from "./flow-instance";
import EditorCanvasSidebar from "./editor-canvas-sidebar";
import { onGetNodesEdges } from "../../../_actions/workflow-connections";
import { useAutoStore } from "@/store";
import {
  onStoreNotionContent,
  onStoreSlackContent,
} from "@/lib/action-handlers";
import { useNodeConnections } from "@/providers/connections-provider";
import axios from "axios";
import { getUserId } from "@/app/(main)/(pages)/connections/_actions/get-user";
import { useBilling } from "@/providers/billing-provider";
import { chatGPTWithPDF } from "@/app/(main)/(pages)/connections/_actions/openai-connection";
import { addContextToNotionPage } from "@/app/(main)/(pages)/connections/_actions/notion-connection";
type Props = {};

const initialNodes: EditorNodeType[] = [];

const initialEdges: { id: string; source: string; target: string }[] = [];

const EditorCanvas = (props: Props) => {
  const { state, dispatch } = useEditor();
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [isWorkFlowLoading, setWorkFlowLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { nodeConnection } = useNodeConnections();
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>();
  const pathname = usePathname();
  const {
    notionValue,
    notionDetails,
    selectedSlackChannels,
    slackMessage,
    openai,
    selectedGoogleDriveFile,
    setNotionDetails,
    setNotionValue,
    setSelectedSlackChannels,
    setSlackMessage,
    setOpenai,
    setSelectedGoogleDriveFile,
  } = useAutoStore();
  const { credits, setCredits } = useBilling();
  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      //@ts-ignore
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      //@ts-ignore
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const handleClickCanvas = () => {
    dispatch({
      type: "SELECTED_ELEMENT",
      payload: {
        element: {
          data: {
            completed: false,
            current: false,
            description: "",
            metadata: {},
            title: "",
            type: "Trigger",
          },
          id: "",
          position: { x: 0, y: 0 },
          type: "Trigger",
        },
      },
    });
  };

  useEffect(() => {
    dispatch({ type: "LOAD_DATA", payload: { edges, elements: nodes } });
  }, [nodes, edges]);

  const startWorkflow = async () => {
    const filteredNodes = nodes.filter((node) => node.type !== "Trigger" && node.type !== "Google Drive");
    if (Number(credits) > 0 || credits === "Unlimited") {
      let lastNode = ''
      try {
        for (const node of filteredNodes) {
          if (node.type === "Slack") {
            console.log(lastNode)
            // Create a new nodeConnection object with the updated content
            const updatedNodeConnection = {
              ...nodeConnection,
              slackNode: {
                ...nodeConnection.slackNode,
                // Only update content if previous node was AI
                content: lastNode === "AI" ? openai.output : nodeConnection.slackNode.content
              }
            };

            console.log(updatedNodeConnection)
            
            const response = await onStoreSlackContent(
              updatedNodeConnection,
              selectedSlackChannels,
              setSelectedSlackChannels
            );

            if (response.message !== "Success") {
              toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Failed to process Slack node",
              });
              return; // Exit the function early
            }
          }

          if (node.type === "Notion") {
            nodeConnection.notionDetails = notionDetails;
            const response = await onStoreNotionContent(nodeConnection);

            if (lastNode === "AI") {
              await addContextToNotionPage(response?.id, nodeConnection.notionNode.accessToken, openai.output);
            }
            
            if (!response) {
              toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Failed to process Notion node",
              });
              return; // Exit the function early
            }
          }

          if (node.type === "AI") {
            const response = await chatGPTWithPDF(openai.input, {id: selectedGoogleDriveFile?.id});
            setOpenai({ ...openai, output: response });
          }

          lastNode = node.type
        }
        chargeCredit();
        // If we get here, all operations succeeded
        toast({
          title: "Success",
          description: "Workflow executed successfully",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Not enough credits",
        description: "You need to have at least 1 credit to run the workflow",
      });
    }
  };

  const chargeCredit = async () => {
    const userId = await getUserId();

    try {
      const response = await axios.post(
        "https://localhost:3000/api/drive-activity/notification",
        null,
        {
          headers: {
            "user-id": userId,
          },
        }
      );
      console.log(response.data); // Logs the response from the server
    } catch (error: any) {
      console.error("Error:", error.response?.data || error.message); // Logs any errors
    } finally {
      setCredits((prevCredits) => (Number(prevCredits) - 1).toString());
    }
  };
  const updateNodes = () => {
    const updatedNodes = nodes.map((node) => {
      const updatedNode = { ...node }; // Create a copy of the node
      console.log("Updating node:", node);

      switch (node.type) {
        case "Notion":
          updatedNode.data = {
            ...node.data,
            metadata: {
              ...node.data.metadata,
              value: notionValue,
              class: notionDetails.class,
              type: notionDetails.type,
              reviewed: notionDetails.reviewed,
            },
          };
          break;
        case "Slack":
          const { selectedSlackChannels } = useAutoStore.getState();
          updatedNode.data = {
            ...node.data,
            metadata: {
              ...node.data.metadata,
              selectedChannels: selectedSlackChannels
                ? [...selectedSlackChannels]
                : [],
              message: slackMessage,
            },
          };
          break;
        case "AI":
          const { openai } = useAutoStore.getState();
          updatedNode.data = {
            ...node.data,
            metadata: {
              ...node.data.metadata,
              input: openai.input,
              output: openai.output,
            },
          };
          break;
        case 'Google Drive':
          const { selectedGoogleDriveFile } = useAutoStore.getState();
          updatedNode.data = {
            ...node.data,
            metadata: {
              ...node.data.metadata,
              selectedFile: selectedGoogleDriveFile,
            },
          };
          break;
        default:
          break;
      }

      return updatedNode;
    });

    setNodes(updatedNodes); // Update state
    return updatedNodes; // Return the updated nodes for immediate use
  };

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const type: EditorCanvasCardType["type"] = event.dataTransfer.getData(
        "application/reactflow"
      );

      if (typeof type === "undefined" || !type) {
        return;
      }

      const triggerAlreadyExists = state.editor.elements.find(
        (node) => node.type === "Trigger"
      );
      if (type === "Trigger" && triggerAlreadyExists) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Only one trigger can be placed into the automation!",
        });
        return;
      }

      if (!reactFlowInstance) return;
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: v4(),
        type,
        position,
        data: {
          title: type,
          description: EditorCanvasDefaultCardTypes[type].description,
          completed: false,
          current: false,
          metadata: {},
          type: type,
        },
      };

      //@ts-ignore
      setNodes((nds) => nds.concat(newNode));
      console.log("New node added", newNode);
    },
    [state, reactFlowInstance]
  );

  const nodeTypes = useMemo(
    () => ({
      Action: EditorCanvasCardSingle,
      Trigger: EditorCanvasCardSingle,
      Email: EditorCanvasCardSingle,
      Condition: EditorCanvasCardSingle,
      AI: EditorCanvasCardSingle,
      Slack: EditorCanvasCardSingle,
      "Google Drive": EditorCanvasCardSingle,
      Notion: EditorCanvasCardSingle,
      Discord: EditorCanvasCardSingle,
      "Custom Webhook": EditorCanvasCardSingle,
      "Google Calendar": EditorCanvasCardSingle,
      Wait: EditorCanvasCardSingle,
    }),
    []
  );

  function loadStoreValues(nodes: any) {
    nodes
      .filter((node: { type: string }) => node.type !== "Trigger")
      .forEach((node: any) => {
        const target = node.data; // Correctly access the data of the current node
        if (target.type === "Notion") {
          setNotionValue(target.metadata.value); // Use target.metadata for the value
          setNotionDetails({
            class: target.metadata.class,
            type: target.metadata.type,
            reviewed: target.metadata.reviewed,
          });
        }
        if (target.type === "Slack") {
          setSelectedSlackChannels(target.metadata.selectedChannels);
          setSlackMessage(target.metadata.message);
        }
        if (target.type === "AI") {
          setOpenai({
            input: target.metadata.input,
            output: target.metadata.output,
          });
        }
        if (target.type === "Google Drive") {
          setSelectedGoogleDriveFile(target.metadata.selectedFile);
        }
      });
  }

  const onGetWorkflow = async () => {
    setWorkFlowLoading(true);
    const response = await onGetNodesEdges(pathname.split("/").pop()!);

    if (response) {
      loadStoreValues(JSON.parse(response?.nodes!));
      setEdges(JSON.parse(response.edges!));
      setNodes(JSON.parse(response.nodes!));
      setWorkFlowLoading(false);
    }

    setWorkFlowLoading(false);
  };

  useEffect(() => {
    onGetWorkflow();
  }, []);

  return (
    <ResizablePanelGroup direction="horizontal" className="">
      <ResizablePanel defaultSize={70}>
        <div className="flex h-full items-center justify-center">
          <div
            style={{ width: "100%", height: "100%", paddingBottom: "70px" }}
            className="relative"
          >
            {isWorkFlowLoading ? (
              <div className="absolute flex h-full w-full items-center justify-center">
                <svg
                  aria-hidden="true"
                  className="inline h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              </div>
            ) : (
              <ReactFlow
                className="w-[300px]"
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodes={state.editor.elements}
                onNodesChange={onNodesChange}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                fitView
                onClick={handleClickCanvas}
                nodeTypes={nodeTypes}
              >
                <Controls position="top-left" />
                <MiniMap
                  position="bottom-left"
                  className="!bg-background"
                  zoomable
                  pannable
                />
                <Background
                  //@ts-ignore
                  variant="dots"
                  gap={12}
                  size={1}
                />
              </ReactFlow>
            )}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={40} className="relative sm:block">
        {isWorkFlowLoading ? (
          <div className="absolute flex h-full w-full items-center justify-center">
            <svg
              aria-hidden="true"
              className="inline h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          </div>
        ) : (
          <FlowInstance
            updateNodes={updateNodes}
            edges={edges}
            nodes={nodes}
            startWorkflow={startWorkflow}
          >
            <EditorCanvasSidebar nodes={nodes} />
          </FlowInstance>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default EditorCanvas;
