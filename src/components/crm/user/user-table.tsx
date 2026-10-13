"use client";

import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { UserItem } from "@/lib/types/user-management";

type UserTableProps = {
  users: UserItem[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  mutationPending: boolean;
  page: number;
  totalPages: number;
  total: number;
  onTogglePermission: (user: UserItem) => void;
  onPageChange: (page: number) => void;
};

export function UserTable({
  users,
  isLoading,
  isError,
  isFetching,
  mutationPending,
  page,
  totalPages,
  total,
  onTogglePermission,
  onPageChange
}: UserTableProps) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Danh sách người dùng</CardTitle>
        <CardDescription>Quyền toàn quyền được cấu hình trên vai trò</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Quyền hệ thống</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground h-28 text-center">
                    <Loader2 className="mr-2 inline size-4 animate-spin" />
                    Đang tải danh sách...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-destructive h-28 text-center">
                    Không tải được người dùng. Kiểm tra API /user/list và quyền truy cập.
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground h-28 text-center">
                    Không tìm thấy người dùng phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const isOperator = user.isOperator === 1;
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">
                          {user.name || user.alias || `User #${user.id}`}
                        </div>
                        <div className="text-muted-foreground text-xs">ID: {user.id}</div>
                      </TableCell>
                      <TableCell>
                        <div>{user.email || "—"}</div>
                        <div className="text-muted-foreground text-xs">{user.phone || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{user.roleName || "Chưa gán vai trò"}</div>
                        {user.branchName && (
                          <div className="text-muted-foreground text-xs">{user.branchName}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.active === 1 ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10"
                          >
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Đã khóa</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isOperator ? (
                          <Badge className="gap-1">
                            <ShieldCheck className="size-3.5" />
                            Toàn quyền
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <ShieldOff className="size-3.5" />
                            Theo vai trò
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={isOperator ? "destructive" : "outline"}
                          onClick={() => onTogglePermission(user)}
                          disabled={!user.roleId || mutationPending}
                        >
                          {isOperator ? "Thu hồi" : "Cấp toàn quyền"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-muted-foreground mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span>
            Trang {page}/{totalPages} · {total} người dùng
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            >
              Tiếp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
