import * as React from "react";
import { Package, ShoppingCart, Users, Tags, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { Link, useLocation } from "@tanstack/react-router";
import { AdminNav } from "@/components/admin/admin-nav";
import { useQuery } from "@tanstack/react-query";
import { meQueryOptions } from "@/lib/tanstack/options/auth";
import { cn } from "@/lib/utils";

const adminItems = [
  {
    name: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard
  },
  {
    name: "Sản phẩm",
    url: "/admin/product",
    icon: Package
  },
  {
    name: "Đơn hàng",
    url: "/admin/order",
    icon: ShoppingCart
  },
  {
    name: "Người dùng",
    url: "/admin/user",
    icon: Users
  },
  {
    name: "Danh mục",
    url: "/admin/category",
    icon: Tags
  }
];

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { data: me } = useQuery(meQueryOptions);

  return (
    <Sidebar
      collapsible="icon"
      className="border-none bg-transparent" // Remove default border
      {...props}
    >
      {/* Brand Header */}
      <SidebarHeader className="px-6 py-8 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* <div className="bg-primary text-primary-foreground shadow-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg group-data-[collapsible=icon]:hidden">
            <LayoutDashboard className="h-6 w-6" />
          </div> */}
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="text-lg leading-none font-bold tracking-tight">CRMS</span>
            <span className="text-muted-foreground mt-1 text-[10px] tracking-widest uppercase">
              System
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {adminItems.map((item) => {
              const isActive =
                item.url === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(item.url);

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.name}
                    className={cn(
                      "h-11 rounded-full px-4 transition-all duration-200", // Pill shaped
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/10 shadow-md"
                        : "text-muted-foreground"
                    )}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-current" : "text-muted-foreground/70"
                        )}
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {/* The AdminNav trigger will inherit the rounded style through its own component logic, 
            but we wrap it in a clean container here */}
        <div className="bg-muted/50 rounded-2xl p-1 backdrop-blur-sm group-data-[collapsible=icon]:bg-transparent">
          <AdminNav
            user={{
              id: me?.id ?? "",
              name: me?.name ?? "Unknown",
              email: me?.email ?? "unknown@example.com",
              role: me?.role ?? "staff"
            }}
          />
        </div>
      </SidebarFooter>

      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
