import { ConnectionProviderProps } from "@/providers/connections-provider";
import { z } from "zod";

export const EditUserProfileSchema = z.object({
  email: z.string().email("Required"),
  name: z.string().min(1, "Required"),
});

export const WorkflowFormSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
});

export type ConnectionTypes = "Google Drive" | "Notion" | "Slack" | "Discord" | "AI";

export type Connection = {
  title: ConnectionTypes;
  description: string;
  image: string;
  connectionKey: keyof ConnectionProviderProps;
  accessTokenKey?: string;
  alwaysTrue?: boolean;
  slackSpecial?: boolean;
};

export type EditorCanvasTypes =
  | "Email"
  | "Condition"
  | "AI"
  | "Slack"
  | "Google Drive"
  | "Notion"
  | "Custom Webhook"
  | "Google Calendar"
  | "Trigger"
  | "Action"
  | "Wait";

export type EditorCanvasCardType = {
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  metadata: any;
  type: EditorCanvasTypes;
};

export type EditorNodeType = {
  id: string;
  type: EditorCanvasCardType["type"];
  position: {
    x: number;
    y: number;
  };
  data: EditorCanvasCardType;
};

export type EditorNode = EditorNodeType;

export type EditorActions =
  | {
      type: "LOAD_DATA";
      payload: {
        elements: EditorNode[];
        edges: {
          id: string;
          source: string;
          target: string;
        }[];
      };
    }
  | {
      type: "UPDATE_NODE";
      payload: {
        elements: EditorNode[];
      };
    }
  | { type: "REDO" }
  | { type: "UNDO" }
  | {
      type: "SELECTED_ELEMENT";
      payload: {
        element: EditorNode;
      };
    };

export const nodeMapper: Record<string, string> = {
  Notion: "notionNode",
  Slack: "slackNode",
  Discord: "discordNode",
  "Google Drive": "googleNode",
  AI: "openaiNode",
};
export type GoogleDriveFile = {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
};
export type NotionPropertyItem = {
  key: string;
  options: { name: string; color: string }[] | null;
  type: "checkbox" | "select";
};
export type NotionProperty = NotionPropertyItem[];