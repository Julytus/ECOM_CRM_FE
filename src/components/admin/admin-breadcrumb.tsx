import { Link, useLocation } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import React from "react";
import { ChevronRight } from "lucide-react";

const adminItems = [
  {
    name: "Tổng quan", // Changed to Vietnamese to match your 404/Layout
    url: "/admin"
  },
  {
    name: "Sản phẩm",
    url: "/admin/product"
  },
  {
    name: "Người dùng",
    url: "/admin/user"
  },
  {
    name: "Đơn hàng",
    url: "/admin/order"
  },
  {
    name: "Danh mục",
    url: "/admin/category"
  }
];

export function AdminBreadcrumb() {
  const location = useLocation();
  const path = location.pathname;

  // Generate breadcrumbs: Start with "Admin" and filter sub-paths
  // This ensures even if you are at /admin/product/1, both "Admin" and "Sản phẩm" show up
  const matchedItems = adminItems.filter((item) => {
    if (item.url === "/admin") {
      return path === "/admin" || path.startsWith("/admin/");
    }
    return path.startsWith(item.url);
  });

  return (
    <Breadcrumb className="ml-2">
      <BreadcrumbList className="gap-1 sm:gap-2">
        {matchedItems.map((item, index) => {
          const isLast = index === matchedItems.length - 1;

          return (
            <React.Fragment key={item.url}>
              {index > 0 && (
                <BreadcrumbSeparator className="opacity-40 [&>svg]:size-3.5">
                  <ChevronRight />
                </BreadcrumbSeparator>
              )}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-foreground font-bold tracking-tight transition-colors">
                    {item.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to={item.url}
                      className="text-muted-foreground hover:text-primary font-medium tracking-tight transition-colors"
                    >
                      {item.name}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
