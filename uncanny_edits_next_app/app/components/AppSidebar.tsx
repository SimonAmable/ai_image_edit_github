import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger
} from "@/components/ui/sidebar"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Home, Pen, User, Zap, Gem, Mic, Plus } from 'lucide-react'
import { NavUser } from "./UserSidebarNav"
import Link from "next/link"
import { ModeToggle } from "./ModeToggle"
import FeedbackSidebarItem from "./FeedbackSidebarItem"

// Sidebar menu data constant
const sidebarMenuItems = [
  {
    id: "home",
    title: "Home",
    icon: Home,
    description: "Home",
    href: "/"
  },
  {
    id: "profile",
    title: "Profile",
    icon: User,
    description: "View and manage your profile",
    href: "/profile"
  },
  {
    id: "pricing",
    title: "Pricing",
    icon: Gem,
    description: "View and manage your pricing",
    href: "/pricing"
  },
  {
    id: "create",
    title: "Create Image",
    icon: Plus,
    description: "Create new images with AI",
    href: "/create"
  },
  {
    id: "speech-to-text",
    title: "Speech to Text",
    icon: Mic,
    description: "Convert speech to text using AI",
    href: "/speech-to-text"
  },
  {
    id: "edit",
    title: "Edit Image",
    icon: Pen,
    description: "View and edit your Canvas",
    href: "/editor"
  },
]

function LogoTitle() {
  return (
    <Link href="/" className="py-1">
      <SidebarMenu className="">
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-foreground">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold text-sidebar-foreground">SAAS.ai</span>
              <span className="text-xs text-muted-foreground">Simple SaaS Template</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </Link>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props} >
      <SidebarHeader>
        <LogoTitle />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {sidebarMenuItems.map((item) => {
              const IconComponent = item.icon
              return (
                <SidebarMenuItem key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={item.href} className="w-full">
                        <SidebarMenuButton className="w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                          <IconComponent className="w-4 h-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              )
            })}

            <FeedbackSidebarItem />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-2 items-start justify-center">
          <SidebarTrigger className="ml-1" />
          <ModeToggle />
        </div>

        <div>
          <NavUser />
        </div>

        <div className="flex flex-row gap-2 text-xs text-muted-foreground text-center w-full justify-center">
        </div>
      </SidebarFooter>
      <SidebarRail className="bg-sidebar" />
    </Sidebar>
  )
}