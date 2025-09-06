'use client';

import React, { useState } from 'react';
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

export default function FeedbackSidebarItem() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SidebarMenuItem>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton 
              className="w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => setOpen(true)}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Feedback</span>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Send us your feedback</p>
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
      <FeedbackModal open={open} onOpenChange={setOpen} />
    </>
  );
} 