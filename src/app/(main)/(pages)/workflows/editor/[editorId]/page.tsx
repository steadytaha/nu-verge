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
    <div className="h-full relative">
      {/* Display a message on mobile screens */}
      <section className="h-full w-full backdrop-blur-sm absolute z-50 flex items-center justify-center text-white px-4 md:hidden">
        <p className="text-center">
          This page cannot be displayed on mobile devices. Please use a larger screen for the full experience.
        </p>
      </section>
  
      {/* Editor content wrapped inside providers */}
      <EditorProvider>
        <ConnectionsProvider>
          <EditorCanvas />
        </ConnectionsProvider>
      </EditorProvider>
    </div>
  );
  
};

export default Page;
