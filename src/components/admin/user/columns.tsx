import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, UserCog, ShieldAlert, ShieldCheck, Ban, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserDTO } from "@/lib/types/user";

interface CreateUserColumnsProps {
  onView: (user: UserDTO) => void;
  onToggleStatus: (user: UserDTO) => void;
}

export const createUserColumns = ({
  onView,
  onToggleStatus
}: CreateUserColumnsProps): ColumnDef<UserDTO>[] => [
  {
    accessorKey: "name",
    header: "Người dùng",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={user.avatar ?? ""} alt={user.name} />
            <AvatarFallback className="text-xs">
              {user.name?.substring(0, 2).toUpperCase() || "US"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="leading-none font-medium">{user.name}</span>
            <span className="text-muted-foreground text-xs">@{user.username}</span>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "email",
    header: "Email & Liên hệ",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex flex-col gap-1">
          <span className="text-sm">{user.email}</span>
          <span className="text-muted-foreground text-xs">{user.phone || "Chưa cập nhật"}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "role",
    header: "Vai trò",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={role === "admin" ? "default" : "secondary"} className="capitalize">
          {role === "admin" ? (
            <ShieldCheck className="mr-1 h-3 w-3" />
          ) : (
            <UserCog className="mr-1 h-3 w-3" />
          )}
          {role}
        </Badge>
      );
    }
  },
  {
    accessorKey: "active",
    header: "Trạng thái",
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean;

      return (
        <Badge
          variant={active ? "outline" : "destructive"}
          className={active ? "border-green-500 text-green-600 dark:text-green-400" : ""}
        >
          {active ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <Ban className="mr-1 h-3 w-3" />}
          {active ? "Hoạt động" : "Bị khóa"}
        </Badge>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Quản lý tài khoản</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(user)}>
              <UserCog className="mr-2 h-4 w-4" />
              Xem thông tin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onToggleStatus(user)}
              className={
                user.active
                  ? "text-destructive focus:text-destructive"
                  : "text-green-600 focus:text-green-600"
              }
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              {user.active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
