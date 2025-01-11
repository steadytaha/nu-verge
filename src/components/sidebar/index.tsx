"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { menuOptions } from "@/lib/constant";
import clsx from "clsx";
import { Separator } from "@/components/ui/separator";
import {
  Database,
  GitBranch,
  LucideMousePointerClick,
  Menu,
  Play,
} from "lucide-react";
import { ModeToggle } from "../global/mode-toggle";
import Image from "next/image";

type Props = {};

const MenuOptions = (props: Props) => {
  const pathName = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  // Manage body scroll behavior
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = ""; // Re-enable scrolling
    }

    // Cleanup: ensure scrolling is restored when component unmounts
    return () => {
      document.body.style.overflow = ""; // Reset on unmount
    };
  }, [isOpen]);
  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu size={24} />
      </button>
      <nav
        className={`${
          isOpen ? "block" : "hidden"
        } dark:bg-black h-screen overflow-scroll justify-between md:flex items-center min-w-24 md:min-w-0 flex-col gap-10 py-6 px-2 pt-4 md:pt-4`}
      >
        <div className="flex items-center justify-center flex-col gap-8">
          <Link className="flex font-bold flex-row" href="/">
            <Image
              src="/black-logo-letter.png"
              width={40}
              height={40}
              alt="Logo"
              className="shadow-sm"
            />
          </Link>
          <TooltipProvider>
            {menuOptions.map((menuItem) => (
              <ul key={menuItem.name}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger>
                    <li>
                      <Link
                        href={menuItem.href}
                        className={clsx(
                          "group h-8 w-8 flex items-center justify-center scale-[1.5] rounded-lg p-[3px] cursor-pointer",
                          {
                            "dark:bg-[#2F006B] bg-[#EEE0FF]":
                              pathName === menuItem.href,
                          }
                        )}
                      >
                        <menuItem.Component
                          selected={pathName === menuItem.href}
                        />
                      </Link>
                    </li>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-black/10 backdrop-blur-xl text-white"
                  >
                    <p>{menuItem.name}</p>
                  </TooltipContent>
                </Tooltip>
              </ul>
            ))}
          </TooltipProvider>
          <Separator />
          <div className="flex items-center flex-col gap-9 dark:bg-[#353346]/30 py-4 px-2 rounded-full h-56 overflow-scroll border-[1px]">
            <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
              <LucideMousePointerClick className="dark:text-white" size={18} />
              <div className="border-l-2 border-muted-foreground/50 h-6 absolute left-1/2 transform translate-x-[-50%] -bottom-[30px]" />
            </div>
            <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
              <GitBranch className="dark:text-white" size={18} />
              <div className="border-l-2 border-muted-foreground/50 h-6 absolute left-1/2 transform translate-x-[-50%] -bottom-[30px]" />
            </div>
            <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
              <Database className="dark:text-white" size={18} />
              <div className="border-l-2 border-muted-foreground/50 h-6 absolute left-1/2 transform translate-x-[-50%] -bottom-[30px]" />
            </div>
            <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
              <Play className="dark:text-white" size={18} />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center flex-col">
          <ModeToggle />
        </div>
      </nav>
      {/* {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )} */}
    </>
  );
};

export default MenuOptions;
