"use client";

import { ShieldCheck, Users, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserItem } from "@/lib/types/user-management";

type UserStatsProps = {
  users: UserItem[];
  total: number;
};

export function UserStats({ users, total }: UserStatsProps) {
  const operatorCount = users.filter((user) => user.isOperator === 1).length;
  const missingRoleCount = users.filter((user) => !user.roleId).length;

  const stats = [
    {
      title: "Tổng người dùng",
      value: total,
      description: "Theo kết quả API",
      icon: Users,
    },
    {
      title: "Có quyền toàn quyền",
      value: operatorCount,
      description: "Trong trang hiện tại",
      icon: ShieldCheck,
    },
    {
      title: "Chưa có vai trò",
      value: missingRoleCount,
      description: "Trong trang hiện tại",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map(({ title, value, description, icon: Icon }) => (
        <Card key={title} className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <CardDescription className="text-xs">{description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
