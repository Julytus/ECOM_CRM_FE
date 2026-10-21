"use client";

import * as React from "react";
import {
  Blocks,
  Cog,
  Command,
  Database,
  KeySquare,
  LifeBuoy,
  Receipt,
  Send,
  ShieldCheck,
  ShoppingCart,
  Users
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { CrmMain } from "@/components/crm/crm-main";
import { CrmSecondary } from "@/components/crm/crm-secondary";
import { meQueryOptions } from "@/lib/tanstack/options/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { permissionResourceQueryOptions } from "@/lib/tanstack/options/permission";

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
  ]
};

/**
 * 4 mục quản trị hệ thống — ẩn/hiện theo quyền VIEW thật của role đăng nhập
 * (so khớp `code` với kết quả `/permission/resource`, phase 2). `code` khớp
 * đúng 4 mã resource hệ thống xác nhận trong seed `crm_jlt.sql`.
 */
const ADMIN_NAV_ITEMS = [
  { code: "USER", title: "Người dùng", url: "/crm/user", icon: Users },
  { code: "RESOURCE", title: "Tài nguyên", url: "/crm/resource", icon: Database },
  { code: "MODULE", title: "Module", url: "/crm/module", icon: Blocks },
  { code: "ROLE", title: "Chức vụ", url: "/crm/role", icon: ShieldCheck },
  { code: "PERMISSION", title: "Phân quyền", url: "/crm/permission", icon: KeySquare },
  { code: "INVOICE", title: "Hóa đơn", url: "/crm/invoice", icon: Receipt }
] as const;

export function CrmSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: me } = useQuery(meQueryOptions);

  const location = useLocation();
  const { data: permissionResources, isError: isPermissionError } = useQuery({
    ...permissionResourceQueryOptions(),
    retry: 1
  });

  // Operator luôn thấy đủ mục quản trị, không phụ thuộc dữ liệu permission.
  // Người dùng thường lọc theo quyền VIEW; chỉ fail-open khi query lỗi.
  // Khi đang tải, `permissionResources` là `undefined` nên mục tạm ẩn hết.
  // Backend vẫn chặn ở API nên đây chỉ là ẩn/hiện UI, không phải lớp bảo vệ.
  const visibleAdminItems = me?.isOperator === 1
    ? ADMIN_NAV_ITEMS
    : isPermissionError
    ? ADMIN_NAV_ITEMS
    : ADMIN_NAV_ITEMS.filter((item) =>
        permissionResources?.some(
          (resource) => resource.code === item.code && resource.actions.includes("VIEW")
        )
      );

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

        {visibleAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Quản trị hệ thống</SidebarGroupLabel>
            <SidebarMenu>
              {visibleAdminItems.map((item) => (
                <SidebarMenuItem key={item.code}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.url}
                    asChild
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span className="font-bold">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

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
