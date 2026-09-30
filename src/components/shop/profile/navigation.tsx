"use client";

import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { User, ShoppingBag, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ProfileNavigationProps {
  user?: {
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
  };
}

export function ProfileNavigation({ user }: ProfileNavigationProps) {
  const location = useLocation();

  return (
    <aside className="w-full md:w-1/3 lg:w-1/4">
      <div className="bg-card flex flex-col items-center rounded-xl border p-8 text-center shadow-sm">
        <Avatar className="border-background mb-4 h-24 w-24 border-4 shadow-md">
          <AvatarImage src={user?.avatar || ""} />
          <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold uppercase">
            {user?.name?.substring(0, 2) || "U"}
          </AvatarFallback>
        </Avatar>

        <h6 className="w-full truncate text-lg font-bold">{user?.name}</h6>
        <p className="text-muted-foreground w-full truncate text-sm">{user?.email}</p>

        <nav className="mt-8 w-full text-left">
          <ul className="space-y-1">
            <ProfileNavItem
              to="/profile"
              icon={<User size={18} />}
              label="Chi tiết tài khoản"
              isActive={location.pathname === "/profile"}
            />
            <ProfileNavItem
              to="/orders"
              icon={<ShoppingBag size={18} />}
              label="Đơn hàng"
              isActive={location.pathname === "/orders"}
            />

            <Separator className="my-2" />

            <ProfileNavItem
              to="/logout"
              icon={<LogOut size={18} />}
              label="Đăng xuất"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            />
          </ul>
        </nav>
      </div>
    </aside>
  );
}

interface ProfileNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  className?: string;
}

function ProfileNavItem({ to, icon, label, isActive, className }: ProfileNavItemProps) {
  return (
    <li>
      <Link
        to={to}
        className={cn(
          "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted text-muted-foreground hover:text-foreground",
          className
        )}
      >
        {icon}
        {label}
      </Link>
    </li>
  );
}
