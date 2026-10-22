"use client";

import * as React from "react";
import {
  Cog,
  Command,
  Database,
  KeySquare,
  LifeBuoy,
  Award,
  Receipt,
  Send,
  ShoppingCart,
  Search,
  Users
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { CrmMain, type CrmNavItem } from "@/components/crm/sidebar/crm-main";
import { CrmSecondary } from "@/components/crm/sidebar/crm-secondary";
import { meQueryOptions } from "@/lib/tanstack/options/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { permissionResourceQueryOptions } from "@/lib/tanstack/options/permission";

/** Mục con "Bán hàng"; `code` khớp resource BE (URI controller: /product/, /order/, /categoryItem/, /report/). */
const SALES_ITEMS = [
  { code: "PRODUCT", title: "Sản phẩm", url: "/crm/product" },
  { code: "ORDER", title: "Đơn hàng", url: "/crm/order" },
  { code: "CATEGORY_ITEM", title: "Danh mục", url: "/crm/category" },
  { code: "VOUCHER", title: "Voucher", url: "/crm/voucher" },
  { code: "REPORT", title: "Doanh thu", url: "/crm/revenue" }
] as const;

const NAV_SECONDARY = [
  { title: "Support", url: "#", icon: LifeBuoy },
  { title: "Feedback", url: "#", icon: Send }
];

/**
 * Mục ẩn/hiện theo quyền VIEW thật của role đăng nhập (so khớp `code` với kết
 * quả `/permission/resource`). `code` khớp mã resource hệ thống trong seed
 * `crm_jlt.sql`.
 */
const USER_ITEM = { code: "USER", title: "Người dùng", url: "/crm/user", icon: Users } as const;
const PERMISSION_ITEM = {
  code: "PERMISSION",
  title: "Phân quyền",
  url: "/crm/permission",
  icon: KeySquare
} as const;
const INVOICE_ITEM = { code: "INVOICE", title: "Hóa đơn", url: "/crm/invoice", icon: Receipt } as const;
const LOYALTY_ITEM = { code: "LOYALTY", title: "Loyalty", url: "/crm/loyalty", icon: Award } as const;
const LOYALTY_CUSTOMER_ITEM = { code: "LOYALTY", title: "Tra cứu điểm", url: "/crm/loyalty-customer", icon: Search } as const;

/** Nhóm gộp: tài nguyên / chức vụ / module. Hiện khi có VIEW ít nhất một mục con. */
const SYSTEM_GROUP_ITEMS = [
  { code: "RESOURCE", title: "Tài nguyên", url: "/crm/resource" },
  { code: "ROLE", title: "Chức vụ", url: "/crm/role" },
  { code: "MODULE", title: "Module", url: "/crm/module" }
] as const;

export function CrmSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: me } = useQuery(meQueryOptions);

  const { data: permissionResources, isError: isPermissionError } = useQuery({
    ...permissionResourceQueryOptions(),
    retry: 1
  });

  // Operator luôn thấy đủ, không phụ thuộc dữ liệu permission.
  // Người dùng thường lọc theo quyền VIEW; chỉ fail-open khi query lỗi.
  // Khi đang tải, `permissionResources` là `undefined` nên mục tạm ẩn hết.
  // Backend vẫn chặn ở API nên đây chỉ là ẩn/hiện UI, không phải lớp bảo vệ.
  const canView = (code: string) =>
    me?.isOperator === 1 ||
    isPermissionError ||
    !!permissionResources?.some((r) => r.code === code && r.actions.includes("VIEW"));

  const systemChildren = SYSTEM_GROUP_ITEMS.filter((i) => canView(i.code)).map(
    ({ title, url }) => ({ title, url })
  );

  const salesChildren = SALES_ITEMS.filter((i) => canView(i.code)).map(({ title, url }) => ({
    title,
    url
  }));

  const navMain: CrmNavItem[] = [
    { title: "Quản lý quy trình", url: "/bussiness-process", icon: Cog },
    ...(salesChildren.length > 0
      ? [{ title: "Bán hàng", icon: ShoppingCart, items: salesChildren }]
      : []),
    ...(canView(INVOICE_ITEM.code)
      ? [{ title: INVOICE_ITEM.title, url: INVOICE_ITEM.url, icon: INVOICE_ITEM.icon }]
      : []),
    ...(canView(LOYALTY_ITEM.code)
      ? [
          { title: LOYALTY_ITEM.title, url: LOYALTY_ITEM.url, icon: LOYALTY_ITEM.icon },
          { title: LOYALTY_CUSTOMER_ITEM.title, url: LOYALTY_CUSTOMER_ITEM.url, icon: LOYALTY_CUSTOMER_ITEM.icon }
        ]
      : []),
    ...(systemChildren.length > 0
      ? [{ title: "Cấu hình hệ thống", icon: Database, items: systemChildren }]
      : [])
  ];

  const navAdmin: CrmNavItem[] = [USER_ITEM, PERMISSION_ITEM]
    .filter((i) => canView(i.code))
    .map(({ title, url, icon }) => ({ title, url, icon }));

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
                <div className="grid flex-1 text-left text-lg leading-tight">
                  <span className="font-semibold">CRM System</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <CrmMain label="Chức năng chính" items={navMain} />

        {navAdmin.length > 0 && <CrmMain label="Quản trị hệ thống" items={navAdmin} />}

        <CrmSecondary items={NAV_SECONDARY} className="mt-auto" />
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
