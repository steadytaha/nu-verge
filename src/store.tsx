import { create } from "zustand";
import { GoogleDriveFile } from "./lib/types";

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  fixed?: boolean;

  [key: string]: string | boolean | undefined;
}

type AutoStore = {
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
};

export const useAutoStore = create<AutoStore>()((set) => ({
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
  setSelectedSlackChannels: (selectedSlackChannels: Option[]) =>
    set({ selectedSlackChannels }),
  slackMessage: "",
  setSlackMessage: (slackMessage: string) => set({ slackMessage }),
}));
