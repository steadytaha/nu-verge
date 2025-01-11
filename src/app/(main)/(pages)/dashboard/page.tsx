import React from "react";
import RadialChart from "./_components/radial-chart";
import { onGetWorkflows } from "../workflows/_actions/workflow-connections";
import { getUserData } from "../connections/_actions/get-user";
import { Vortex } from "@/components/ui/vortex";


const DashboardPage = async () => {
  const workflows = await onGetWorkflows();
  const publishedCount = (workflows ?? []).filter((flow) => flow.publish).length || 0;
  const unpublishedCount = (workflows ?? []).filter((flow) => !flow.publish).length || 0;
  const userData = await getUserData();
  const userName= userData?.name;
  return (
    <div className="flex flex-col gap-4 relative min-h-screen  text-neutral-200">
      {/* Header */}
      <h1 className="text-4xl sticky text-black dark:text-white top-0 z-[10] p-6 bg-background/50/50 backdrop-blur-lg flex items-center border-b border-neutral-700">
        Dashboard
      </h1>

      {/* Welcome Message */}
      <div className="text-black dark:text-white p-6 bg-background/50 shadow-md rounded-lg">
        <h2 className="text-4xl font-semibold">Welcome back {userName}!</h2>
        <p className=" text-lg mt-2">Here’s an overview of your workflows.</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
        {/* Published/Unpublished Radial Chart */}
       
       <RadialChart
            header="You have"
            publishedCount={publishedCount}
            unpublishedCount={unpublishedCount}
          />
  
     

        {/* Key Metrics */}
        <div className="bg-background/50 text-black dark:text-white shadow-md rounded-lg p-6 flex flex-col gap-4 border">
          <h3 className="text-lg font-semibold">Key Metrics</h3>
          <div className="flex justify-between items-center">
            <span className="">Total Workflows:</span>
            <span className="text-xl font-bold">{publishedCount + unpublishedCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-black dark:text-white">Published:</span>
            <span className="text-xl font-bold">{publishedCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-black dark:text-white">Unpublished:</span>
            <span className="text-xl font-bold">{unpublishedCount}</span>
          </div>
        </div>

        {/* Placeholder for Additional Features */}
        <div className=" text-black dark:text-white bg-background/50 shadow-md rounded-lg p-6 flex flex-col items-center justify-center border">
          <h3 className="text-lg font-semibold">Upcoming Feature</h3>
          <p className=" mt-2 text-center">
            Stay tuned for more insights and functionality.
          </p>
        </div>
      </div>

      <div className="w-[calc(100%-4rem)] mx-auto rounded-md py-24 overflow-hidden">
      <Vortex
        backgroundColor="black"
        rangeY={800}
        particleCount={500}
        baseHue={120}
        className="flex items-center flex-col justify-center px-2 md:px-10  py-4 w-full h-full"
      >
        <h2 className="text-white text-2xl md:text-6xl font-bold text-center">
          This application is still under development!
        </h2>
        <p className="text-white text-sm md:text-2xl max-w-xl mt-6 text-center">
          So be sure to check back soon for more updates and features!
        </p>
        
      </Vortex>
    </div>
    </div>
  );
};

export default DashboardPage;
