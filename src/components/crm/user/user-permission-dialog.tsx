"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { UserItem } from "@/lib/types/user-management";

type UserPermissionDialogProps = {
  user: UserItem | null;
  nextOperator: 0 | 1;
  open: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function UserPermissionDialog({
  user,
  nextOperator,
  open,
  isLoading,
  onOpenChange,
  onConfirm,
}: UserPermissionDialogProps) {
  const granting = nextOperator === 1;
  const roleLabel = user?.roleName || `#${user?.roleId ?? ""}`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <ShieldAlert className="size-5" />
          </div>
          <AlertDialogTitle>
            {granting ? "Cấp quyền toàn quyền?" : "Thu hồi quyền toàn quyền?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {granting
              ? `Bạn đang cấp quyền operator cho vai trò "${roleLabel}".`
              : `Bạn đang thu hồi quyền operator của vai trò "${roleLabel}".`}
            {" "}Tất cả người dùng dùng chung vai trò này sẽ bị ảnh hưởng.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
