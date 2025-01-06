"use client";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { getGoogleListener } from "../../../_actions/workflow-connections";
import { Card, CardDescription } from "@/components/ui/card";
import { CardContainer } from "@/components/global/3d-card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoogleDriveFile } from "@/lib/types";
import { useAutoStore } from "@/store";

const GoogleDriveFiles = () => {
  const initialized = useRef(false);
  const globalStore = useAutoStore();
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const initializeComponent = async () => {
    if (initialized.current) return;
    if (globalStore.googleDriveFiles.length > 0) {
      initialized.current = true;
      return;
    }

    setLoading(true);
    try {
      // Check listener status
      const listener = await getGoogleListener();
      setIsListening(!!listener?.googleResourceId);

      if (!isListening) {
        // Fetch files only if not listening
        const response = await axios.get("/api/drive", {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });

        if (response.data?.message?.files) {
          globalStore.setGoogleDriveFiles(response.data.message.files);
          toast({
            description: `Found ${response.data.message.files.length} files`,
          });
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.response?.data?.details || "Failed to fetch files",
      });
    } finally {
      setLoading(false);
      initialized.current = true;
    }
  };

  const handleSelectedChange = (id: string) => {
    const file = globalStore.googleDriveFiles.find((file) => file.id === id);
    if (file) globalStore.setSelectedGoogleDriveFile(file);
  };

  useEffect(() => {
    initializeComponent();
    // Cleanup function
    return () => {
      initialized.current = false;
    };
  }, []);

  if (isListening) {
    return (
      <Card className="py-3">
        <CardContainer>
          <CardDescription>Listening...</CardDescription>
        </CardContainer>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-6">
      {loading ? (
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
        <Select
          defaultValue={globalStore.selectedGoogleDriveFile?.id || ""}
          onValueChange={handleSelectedChange}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a file" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Files</SelectLabel>
              {globalStore.googleDriveFiles.map((file, index) => (
                <SelectItem key={index} value={file.id}>
                  <SelectLabel>{file.name}</SelectLabel>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default GoogleDriveFiles;