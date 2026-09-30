"use client";

import { useNavigate } from "@tanstack/react-router";
import { User, LogOut, MoreVertical, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AdminNav({
  user
}: {
  user: {
    id: string | number;
    name: string;
    email: string;
    role: string;
  };
}) {
  const navigate = useNavigate();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "h-14 rounded-2xl transition-all duration-200", // Taller and rounder
                "hover:bg-accent/50 data-[state=open]:bg-accent"
              )}
            >
              <Avatar className="border-background h-9 w-9 rounded-full border-2 shadow-sm">
                <AvatarImage
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  alt={user.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary rounded-full text-xs font-bold">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="ml-3 grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-foreground truncate font-bold tracking-tight">
                  {user.name}
                </span>
                <span className="text-muted-foreground truncate text-[11px] font-medium tracking-wider uppercase">
                  {user.role}
                </span>
              </div>

              <MoreVertical className="text-muted-foreground ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            style={{ minWidth: "var(--radix-dropdown-menu-trigger-width)" }}
            side="right"
            align="end"
            sideOffset={8}
            className="shadow-foreground/5 w-64 rounded-2xl border-0 p-2 shadow-xl"
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-3 text-left">
                <Avatar className="border-border h-10 w-10 rounded-full border">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                    alt={user.name}
                  />
                  <AvatarFallback className="rounded-full font-bold">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-base font-bold tracking-tight">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuGroup className="flex flex-col gap-1">
              <DropdownMenuItem
                onClick={() => navigate({ to: "/profile" })} // Assuming profile management is here
                className="cursor-pointer rounded-xl py-2.5"
              >
                <User className="text-muted-foreground mr-3 h-4 w-4" />
                <span className="font-medium">Thông tin cá nhân</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-not-allowed rounded-xl py-2.5 opacity-50">
                <ShieldCheck className="text-muted-foreground mr-3 h-4 w-4" />
                <span className="font-medium">Cài đặt bảo mật</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem
              onClick={() => navigate({ to: "/" })}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-xl py-2.5"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span className="font-medium">Thoát quản trị</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
