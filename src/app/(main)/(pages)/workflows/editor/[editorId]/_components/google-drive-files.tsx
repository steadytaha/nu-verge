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
  const {
    googleDriveFiles,
    setIsStoreLoading,
    setSelectedGoogleDriveFile,
    selectedGoogleDriveFile,
    setGoogleDriveFiles,
  } = useAutoStore();
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const initializeComponent = async () => {
    if (initialized.current) return;
    if (googleDriveFiles.length > 0) {
      initialized.current = true;
      return;
    }

    setIsStoreLoading(true);
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
          setGoogleDriveFiles(response.data.message.files);
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
      setIsStoreLoading(false);
      initialized.current = true;
    }
  };

  const handleSelectedChange = (id: string) => {
    const file = googleDriveFiles.find((file) => file.id === id);
    if (file) setSelectedGoogleDriveFile(file);
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
      <Select
        defaultValue={selectedGoogleDriveFile?.id || ""}
        onValueChange={handleSelectedChange}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a file" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Files</SelectLabel>
            {googleDriveFiles.map((file, index) => (
              <SelectItem key={index} value={file.id}>
                <SelectLabel>{file.name}</SelectLabel>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default GoogleDriveFiles;
