"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar";

export function CrmMain({
  items
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const location = useLocation();

  const pathname = location.pathname;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Chức năng chính</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const isChildActive = item.items?.some((subItem) => pathname === subItem.url);

          const isParentActive = pathname === item.url || isChildActive;
          return (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive || isChildActive}>
              <SidebarMenuItem>
                {/* MENU CHA */}
                <SidebarMenuButton isActive={isParentActive} asChild tooltip={item.title}>
                  <Link to={item.url}>
                    <item.icon />
                    <span className="font-bold"> {item.title}</span>
                  </Link>
                </SidebarMenuButton>

                {/* MENU CON */}
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => {
                          const isActive = pathname === subItem.url;

                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={isActive}>
                                <Link to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
