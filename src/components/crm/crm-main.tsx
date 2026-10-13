"use client";

import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

export type CrmNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  description?: string;
};

export function CrmMain({ items }: { items: CrmNavItem[] }) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup className="px-3 py-3">
      <SidebarGroupLabel className="text-sidebar-foreground/50 px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
        Không gian làm việc
      </SidebarGroupLabel>

      <SidebarMenu className="gap-1.5">
        {items.map((item) => {
          const isActive =
            pathname === item.url || (item.url !== "/" && pathname.startsWith(`${item.url}/`));

          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.title}
                className={[
                  "group relative h-11 rounded-xl px-3 transition-all duration-200",
                  "hover:bg-sidebar-accent/80 hover:translate-x-0.5",
                  "data-[active=true]:bg-sidebar-primary data-[active=true]:font-semibold",
                  "data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-sm",
                  "data-[active=true]:hover:bg-sidebar-primary"
                ].join(" ")}
              >
                <Link to={item.url} aria-current={isActive ? "page" : undefined}>
                  <item.icon
                    className={[
                      "size-[18px] shrink-0 transition-transform duration-200",
                      "group-hover:scale-105"
                    ].join(" ")}
                    strokeWidth={isActive ? 2.3 : 1.8}
                  />
                  <span className="text-sm">{item.title}</span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="bg-sidebar-primary-foreground/90 absolute right-2 h-1.5 w-1.5 rounded-full"
                    />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
