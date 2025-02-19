import React from "react";
import UnderConstruction from "@/app/(main)/(pages)/under-construction";
const LogsPage = () => {
  return (
    <div className="flex flex-col gap-4 relative ">
      <h1 className="text-4xl sticky top-0 z-[10] p-6 bg-background/50 backdrop-blur-lg flex items-center border-b">
        Logs
      </h1>
      <UnderConstruction />
    </div>
  );
};

export default LogsPage;
