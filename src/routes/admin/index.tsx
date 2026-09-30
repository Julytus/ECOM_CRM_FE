"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingCart, Users, Tags, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Your actual navigation items
const adminItems = [
  {
    name: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    description: "Tổng quan hệ thống và các chỉ số vận hành."
  },
  {
    name: "Sản phẩm",
    url: "/admin/product",
    icon: Package,
    description: "Quản lý kho hàng, cập nhật giá và tồn kho."
  },
  {
    name: "Đơn hàng",
    url: "/admin/order",
    icon: ShoppingCart,
    description: "Theo dõi trạng thái và xử lý vận chuyển."
  },
  {
    name: "Người dùng",
    url: "/admin/user",
    icon: Users,
    description: "Phân quyền và quản lý thông tin nhân sự."
  },
  {
    name: "Danh mục",
    url: "/admin/category",
    icon: Tags,
    description: "Cấu trúc phân loại sản phẩm và menu."
  }
];

export const Route = createFileRoute("/admin/")({
  component: AdminHome
});

function AdminHome() {
  return (
    <div className="min-h-screen bg-stone-50/50 p-6 md:p-12 lg:p-20">
      {/* Header Section */}
      <header className="mb-16 max-w-3xl space-y-4">
        <div className="flex items-center gap-3 text-stone-400">
          <div className="h-[1px] w-10 bg-stone-300" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase">
            Hệ thống quản trị
          </span>
        </div>

        <h1 className="font-serif text-5xl font-normal tracking-tight text-stone-900 md:text-7xl">
          Xin chào, <span className="text-stone-300 italic">Quản trị viên</span>
        </h1>

        <p className="max-w-md text-sm leading-relaxed text-stone-500">
          Chào mừng bạn quay lại. Vui lòng lựa chọn các phân khu chức năng bên dưới để bắt đầu quản
          lý hệ thống dữ liệu của bạn.
        </p>
      </header>

      {/* Navigation Portal Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminItems
          .filter((item) => item.url !== "/admin")
          .map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-8 transition-all hover:border-stone-900 hover:shadow-2xl hover:shadow-stone-200/50"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-2xl bg-stone-50 p-3 text-stone-600 transition-colors group-hover:bg-stone-900 group-hover:text-white">
                  <item.icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 -translate-x-4 text-stone-900 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </div>

              <div className="mt-12">
                <h3 className="font-serif text-2xl font-medium text-stone-900">{item.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-stone-400">{item.description}</p>
              </div>

              {/* Subtle background decoration */}
              <span className="absolute -top-4 -right-4 font-serif text-9xl font-bold text-stone-50 opacity-0 transition-opacity group-hover:opacity-100">
                {item.name[0]}
              </span>
            </Link>
          ))}

        {/* Static System Info Card */}
        <div className="flex flex-col justify-center rounded-[2rem] bg-stone-900 p-8 text-white">
          <p className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">
            Trạng thái thiết bị
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-sm font-medium">Kết nối ổn định</span>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-stone-400 italic">
            "Mọi thay đổi trên dữ liệu sẽ được ghi nhận trực tiếp vào nhật ký hệ thống."
          </p>
        </div>
      </div>

      {/* Footer Text */}
      <footer className="mt-20 border-t border-stone-200 pt-8">
        <p className="text-[10px] font-medium tracking-widest text-stone-400 uppercase">
          © 2024 Management Portal — Documentation & Support
        </p>
      </footer>
    </div>
  );
}
