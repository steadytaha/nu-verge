import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "@/components/ui/drawer"
import { useModal } from "@/providers/modal-provider"

  import React from 'react'
import { Button } from "../ui/button"
  
  type Props = {
    title: string
    subheading: string
    children: React.ReactNode
    defaultOpen?: boolean
  }
  
  const CustomModal = ({ children, subheading, title, defaultOpen }: Props) => {
    const { isOpen, setClose } = useModal()
    const handleClose = () => setClose()

    return (
      <Drawer
        open={isOpen}
        onClose={handleClose}
        >
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="text-center">{title}</DrawerTitle>
                    <DrawerDescription asChild >
                      <div className="text-center flex flex-col items-center gap-4 h-64 overflow-scroll">
                      {subheading}
                      {children}
                      </div>
                    
                    </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className="flex flex-col gap-4 bg-background border-t-[1px} border-t-muted">
                    <DrawerClose asChild>
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={handleClose}
                            >
                                Close
                            </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
  }
  
  export default CustomModal