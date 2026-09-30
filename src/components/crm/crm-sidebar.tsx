"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Cog,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  ShoppingCart,
  SquareTerminal
} from "lucide-react";

import { CrmMain } from "@/components/crm/crm-main";
import { CrmProjects } from "@/components/crm/crm-projects";
import { CrmSecondary } from "@/components/crm/crm-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { useLocation } from "node_modules/@tanstack/react-router/dist/esm/useLocation";

const data = {
  navMain: [
    {
      title: "Quản lý quy trình",
      url: "/bussiness-process",
      icon: Cog
    },
    {
      title: "Bán hàng",
      url: "",
      icon: ShoppingCart,
      isActive: true,
      items: [
        {
          title: "Sản phẩm",
          url: "/crm/product"
        },
        {
          title: "Đơn hàng",
          url: "/crm/order"
        },
        {
          title: "Danh mục",
          url: "/crm/category"
        }
      ]
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#"
        },
        {
          title: "Get Started",
          url: "#"
        },
        {
          title: "Tutorials",
          url: "#"
        },
        {
          title: "Changelog",
          url: "#"
        }
      ]
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#"
        },
        {
          title: "Team",
          url: "#"
        },
        {
          title: "Billing",
          url: "#"
        },
        {
          title: "Limits",
          url: "#"
        }
      ]
    }
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send
    }
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart
    },
    {
      name: "Travel",
      url: "#",
      icon: Map
    }
  ]
};

export function CrmSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  //   const { data: me } = useQuery(meQueryOptions);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-xl leading-tight">
                  <span className="font-bold">CRM System</span>
                  {/* <span className="truncate text-xs">System</span> */}
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <CrmMain items={data.navMain} />
        <CrmProjects projects={data.projects} />
        <CrmSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      {/* <SidebarFooter>
        <CrmUser
          user={{
            name: me?.name ?? "Unknown",
            email: me?.email ?? "unknown@example.com",
            avatar: me?.avatar ?? `https://ui-avatars.com/api/?name=${me?.name}&background=random`
          }}
        />
      </SidebarFooter> */}
    </Sidebar>
  );
}
