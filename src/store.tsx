import { create } from "zustand";
import { GoogleDriveFile, NotionProperty } from "./lib/types";

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  fixed?: boolean;

  [key: string]: string | boolean | undefined;
}

type AutoStore = {
  currentIndex: number | null;
  setCurrentIndex: (index: number | null) => void;
  isStoreLoading: boolean;
  setIsStoreLoading: (isStoreLoading: boolean) => void;
  googleDriveFiles: GoogleDriveFile[];
  setGoogleDriveFiles: (googleDriveFiles: GoogleDriveFile[]) => void;
  selectedGoogleDriveFile: GoogleDriveFile | null;
  setSelectedGoogleDriveFile: (
    selectedGoogleDriveFile: GoogleDriveFile | null
  ) => void;
  googleFile: any;
  setGoogleFile: (googleFile: any) => void;
  slackChannels: Option[];
  setSlackChannels: (slackChannels: Option[]) => void;
  selectedSlackChannels: Option[];
  setSelectedSlackChannels: (selectedSlackChannels: Option[]) => void;
  slackMessage: string;
  setSlackMessage: (slackMessage: string) => void;
  notionDetails: {
    class?: string;
    type?: string;
    reviewed?: boolean;
  };
  setNotionDetails: (notionDetails: {
    class?: string;
    type?: string;
    reviewed?: boolean;
  }) => void;
  notionValue: string;
  setNotionValue: (notionValue: string) => void;
  notionProperties: NotionProperty[];
  setNotionProperties: (notionProperties: any) => void;
  openai: {
    input: string;
    output: string;
  };
  setOpenai: (openai: { input: string; output: string }) => void;
  resetStore: () => void;
};

export const useAutoStore = create<AutoStore>()((set) => ({
  currentIndex: 0,
  setCurrentIndex: (index: number) => set({ currentIndex: index }),
  isStoreLoading: false,
  setIsStoreLoading: (isStoreLoading: boolean) => set({ isStoreLoading }),
  selectedGoogleDriveFile: null,
  setSelectedGoogleDriveFile: (
    selectedGoogleDriveFile: GoogleDriveFile | null
  ) => set({ selectedGoogleDriveFile }),
  googleDriveFiles: [],
  setGoogleDriveFiles: (googleDriveFiles: GoogleDriveFile[]) =>
    set({ googleDriveFiles }),
  googleFile: {},
  setGoogleFile: (googleFile: any) => set({ googleFile }),
  slackChannels: [],
  setSlackChannels: (slackChannels: Option[]) => set({ slackChannels }),
  selectedSlackChannels: [],
  setSelectedSlackChannels: (selectedSlackChannels: Option[]) => {
    set({ selectedSlackChannels });
  },
  slackMessage: "",
  setSlackMessage: (slackMessage: string) => set({ slackMessage }),
  notionDetails: {
    class: "",
    type: "",
    reviewed: false,
  },
  setNotionDetails: (notionDetails) => set({ notionDetails }),
  notionValue: "",
  setNotionValue: (notionValue) => set({ notionValue }),
  notionProperties: {
    key: "",
    options: null,
    type: "",
  },

  setNotionProperties: (notionProperties: NotionProperty[]) =>
    set({ notionProperties }),

  openai: {
    input: "",
    output: "",
  },
  setOpenai: (openai: { input: string; output: string }) => set({ openai }),

  resetStore: () =>
    set({
      currentIndex: null,
      isStoreLoading: false,
      selectedGoogleDriveFile: null,
      googleDriveFiles: [],
      googleFile: {},
      slackChannels: [],
      selectedSlackChannels: [],
      slackMessage: "",
      notionDetails: {
        class: "",
        type: "",
        reviewed: false,
      },
      notionValue: "",
      notionProperties: [],
      openai: {
        input: "",
        output: "",
      },
    }),
}));
