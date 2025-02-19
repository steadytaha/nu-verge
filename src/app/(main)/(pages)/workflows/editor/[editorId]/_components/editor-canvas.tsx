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
import { EditorCanvasCardType, EditorNodeType, OperatorType } from "@/lib/types";
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
import { chatGPT } from "@/app/(main)/(pages)/connections/_actions/openai-connection";
import { addContextToNotionPage } from "@/app/(main)/(pages)/connections/_actions/notion-connection";
import { getCondition } from "@/lib/editor-canvas-helper";
import { runWorkflow } from "@/lib/workflow-runner";
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
    slackMessage,
    conditionNode,
    waitNode,
    setNotionDetails,
    setNotionValue,
    setSelectedSlackChannels,
    setSlackMessage,
    setOpenai,
    setSelectedGoogleDriveFile,
    setConditionNode,
    setWaitNode,
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
            index: 0
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
    await runWorkflow(nodes, nodeConnection, credits, setCredits);
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
        case "Google Drive":
          const { selectedGoogleDriveFile } = useAutoStore.getState();
          updatedNode.data = {
            ...node.data,
            metadata: {
              ...node.data.metadata,
              selectedFile: selectedGoogleDriveFile,
            },
          };
          break;
        case "Condition":
          updatedNode.data = {
            ...node.data,
            metadata: {
              ...node.data.metadata,
              operator: conditionNode.operator,
              trueValue: conditionNode.trueValue,
              falseValue: conditionNode.falseValue,
              parameter: conditionNode.parameter,
            },
          };
          break;
        case "Wait":
          updatedNode.data = {
            ...node.data,
            metadata: {
              ...node.data.metadata,
              type: waitNode.jobDetails.type,
              hours: waitNode.jobDetails.hours,
              minutes: waitNode.jobDetails.minutes,
              seconds: waitNode.jobDetails.seconds,
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
      console.log(state.editor);
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
          index: state.editor.elements.length,
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
        if(target.type === "Condition") {
          setConditionNode({
            operator: target.metadata.operator,
            trueValue: target.metadata.trueValue,
            falseValue: target.metadata.falseValue,
            parameter: target.metadata.parameter,
          });
        }
        if(target.type === "Wait") {
          setWaitNode({
            jobDetails: {
              type: target.metadata.type,
              hours: target.metadata.hours,
              minutes: target.metadata.minutes,
              seconds: target.metadata.seconds,
            },
          });
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
      <ResizablePanel defaultSize={65}>
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
                <Controls className="text-black" position="top-left" />
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
      {/* <ResizableHandle  /> */}
      <ResizablePanel defaultSize={35} className="relative sm:block">
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
