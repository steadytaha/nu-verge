"use client";
import React, { useEffect } from "react";
import { ModeToggle } from "../global/mode-toggle";
import { Book, Headphones, Search } from "lucide-react";
import Templates from "../icons/cloud_download";
import { Input } from "@/components/ui/input";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserButton } from "@clerk/nextjs";
import { useBilling } from "@/providers/billing-provider";
import { onPaymentDetails } from "@/app/(main)/(pages)/billing/_actions/payment-connections";
import { onGetWorkflowsByName } from "@/app/(main)/(pages)/workflows/_actions/workflow-connections";
import MultipleSelector from "../ui/multiple-selector";
import SearchByName from "@/app/(main)/(pages)/workflows/_components/searchByName";
import { useRouter } from "next/navigation";

type Props = {};

const InfoBar = (props: Props) => {
  const { credits, tier, setCredits, setTier } = useBilling();

  const onGetPayment = async () => {
    const response = await onPaymentDetails();
    if (response) {
      setTier(response.tier!);
      setCredits(response.credits!);
    }
  };

  useEffect(() => {
    onGetPayment();
  }, []);
const router = useRouter();
  return (
    <div className="flex flex-row justify-end gap-2 md:gap-6 items-center px-4 py-4 w-full dark:bg-black pl-12 md:pl-0 ">
      <span className="flex items-center gap-2 font-bold">
        <p className="text-sm font-light text-gray-300">Credits</p>
        {tier == "Unlimited" ? (
          <span>Unlimited</span>
        ) : (
          <span>
            {credits}/{tier == "Free" ? "10" : tier == "Pro" && "100"}
          </span>
        )}
      </span>
      <SearchByName onClick={(workflowId) => router.push(`/workflows/editor/${workflowId}`)}/>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <Headphones />
          </TooltipTrigger>
          <TooltipContent>
            <p>Contact Support</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <Book />
          </TooltipTrigger>
          <TooltipContent>
            <p>Guide</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <UserButton />
    </div>
  );
};

export default InfoBar;
