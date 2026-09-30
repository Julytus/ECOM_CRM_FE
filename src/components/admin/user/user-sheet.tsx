"use client";

import * as React from "react";
import {
  User,
  Phone,
  Mail,
  CheckCircle2,
  Ban,
  ShieldCheck,
  Calendar,
  Fingerprint,
  UserCircle
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { UserDTO } from "@/lib/types/user";

interface UserViewSheetProps {
  user: UserDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserViewSheet({ user, open, onOpenChange }: UserViewSheetProps) {
  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          "w-full gap-0 border-l border-stone-200 p-0 sm:max-w-xl",
          "flex flex-col bg-stone-50/95 backdrop-blur-xl"
        )}
      >
        {/* Header Section */}
        <div className="relative border-b border-stone-200 bg-white/50 px-8 py-10 shadow-sm">
          <div className="space-y-1">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-6 items-center justify-center rounded-full bg-stone-900 px-3 text-[10px] font-bold tracking-[0.2em] text-white uppercase">
                Hồ sơ tài khoản
              </span>
              <Badge
                variant={user.active ? "outline" : "destructive"}
                className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
              >
                {user.active ? "Đang hoạt động" : "Đã khóa"}
              </Badge>
            </div>

            <SheetHeader className="space-y-0 text-left">
              <SheetTitle className="font-serif text-4xl font-normal tracking-tight text-stone-900">
                {user.name}
              </SheetTitle>
              <SheetDescription className="pt-2 font-medium text-stone-500">
                Thông tin định danh cho tài khoản @{user.username}
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="absolute bottom-0 left-0 h-[2px] w-24 bg-stone-900" />
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto px-8 py-10">
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-10 duration-700">
            {/* Profile Avatar & Primary Info */}
            <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-24 w-24 rounded-full border-4 border-stone-50 object-cover shadow-md"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-100 text-stone-400 shadow-inner">
                    <UserCircle className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute -right-1 -bottom-1 rounded-full bg-white p-1 shadow-sm">
                  {user.role === "admin" ? (
                    <ShieldCheck className="h-6 w-6 text-amber-600" />
                  ) : (
                    <User className="h-6 w-6 text-stone-400" />
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold tracking-widest text-stone-400 uppercase">
                  {user.role}
                </p>
                <p className="text-sm font-medium text-stone-600">{user.email}</p>
              </div>
            </div>

            {/* Detailed Data Grid */}
            <div className="grid grid-cols-1 gap-6">
              <InfoItem
                icon={<Fingerprint className="h-4 w-4" />}
                label="Mã định danh (UID)"
                value={`#${user.id}`}
              />
              <InfoItem
                icon={<Mail className="h-4 w-4" />}
                label="Địa chỉ Email"
                value={user.email}
              />
              <InfoItem
                icon={<Phone className="h-4 w-4" />}
                label="Số điện thoại"
                value={user.phone || "Chưa cập nhật"}
              />
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="Ngày tham gia"
                value="12 Tháng 10, 2023" // Replace with actual date if available
              />
            </div>

            <Separator className="bg-stone-200" />

            {/* Status Section */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                Trạng thái hệ thống
              </p>
              <div
                className={cn(
                  "flex items-center gap-4 rounded-2xl border p-4 transition-all",
                  user.active
                    ? "border-emerald-100 bg-emerald-50/30"
                    : "border-red-100 bg-red-50/30"
                )}
              >
                {user.active ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-900">
                      Tài khoản có quyền truy cập đầy đủ
                    </span>
                  </>
                ) : (
                  <>
                    <Ban className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-red-900">
                      Tài khoản hiện đang bị đình chỉ
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-stone-100 bg-white/30 px-8 py-6">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full rounded-full bg-stone-900 py-6 font-bold tracking-widest text-white uppercase shadow-lg transition-transform hover:scale-[1.02] hover:bg-stone-800 active:scale-95"
          >
            Đóng cửa sổ
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* Helper Component for Scannable Info */
function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-stone-400 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-wider text-stone-400 uppercase">{label}</p>
        <p className="font-serif text-lg text-stone-900">{value}</p>
      </div>
    </div>
  );
}
