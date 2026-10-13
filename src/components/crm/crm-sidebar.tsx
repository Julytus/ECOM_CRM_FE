"use client";

import * as React from "react";
import { BarChart3, Boxes, Command, FolderTree, ShoppingCart, User } from "lucide-react";

import { CrmMain, type CrmNavItem } from "@/components/crm/crm-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from "@/components/ui/sidebar";

const navItems: CrmNavItem[] = [
  {
    title: "Thống kê",
    url: "/crm/dashboard",
    icon: BarChart3,
    description: "Tổng quan kinh doanh"
  },
  {
    title: "Sản phẩm",
    url: "/crm/product",
    icon: Boxes,
    description: "Quản lý sản phẩm"
  },
  {
    title: "Danh mục",
    url: "/crm/category",
    icon: FolderTree,
    description: "Phân loại sản phẩm"
  },
  {
    title: "Đơn hàng",
    url: "/crm/order",
    icon: ShoppingCart,
    description: "Theo dõi đơn hàng"
  },
  {
    title: "Phân quyền",
    url: "/crm/user",
    icon: User,
    description: "Phân quyền và quản lý người dùng"
  }
];

export function CrmSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="px-3 pt-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-sidebar-accent/60 h-[60px] rounded-xl px-2"
            >
              <a href="/" aria-label="Đi đến trang thống kê">
                <div className="from-primary to-primary/70 text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm">
                  <Command className="size-5" strokeWidth={2.2} />
                </div>
                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate text-[15px] font-bold tracking-tight">DASHBOARD</span>
                  <span className="text-sidebar-foreground/55 mt-1 truncate text-[11px]">
                    Quản lý bán hàng
                  </span>
                </div>
                <span className="border-sidebar-border bg-sidebar-accent/50 text-sidebar-foreground/60 rounded-md border px-1.5 py-1 text-[9px] font-semibold tracking-wider">
                  CRM
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <CrmMain items={navItems} />
      </SidebarContent>

      <SidebarFooter className="px-4 pt-2 pb-4">
        <div className="border-sidebar-border/70 bg-sidebar-accent/30 rounded-xl border p-3">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/50" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sidebar-foreground/80 text-xs font-medium">
              Không gian quản trị
            </span>
          </div>
          <p className="text-sidebar-foreground/50 mt-1.5 pl-4 text-[11px] leading-relaxed">
            Tất cả công cụ bán hàng ở một nơi.
          </p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
