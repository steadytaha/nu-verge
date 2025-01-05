"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAutoStore } from "@/store";
import ConnectionsProvider from "@/providers/connections-provider";
import EditorProvider from "@/providers/editor-provider";
import React from "react";
import EditorCanvas from "./_components/editor-canvas";

type Props = {};

const Page = (props: Props) => {
  const pathname = usePathname(); // Tracks the current path
  const resetStore = useAutoStore((state) => state.resetStore);

  useEffect(() => {
    // Reset the store whenever the path changes
    resetStore();
    console.log("Resetting store");
  }, [pathname, resetStore]);
  return (
    <div className="h-full">
      <EditorProvider>
        <ConnectionsProvider>
          <EditorCanvas />
        </ConnectionsProvider>
      </EditorProvider>
    </div>
  );
};

export default Page;
