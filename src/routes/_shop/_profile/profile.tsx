"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { User, ShoppingBag, MapPin, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { meQueryOptions } from "@/lib/tanstack/options/auth";
import { QueryBoundary } from "@/components/boundary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PageWrapper } from "@/components/layout/page-warper";
import { ProfileForm } from "@/components/form/block/profile-form";
import { ProfileNavigation } from "@/components/shop/profile/navigation";

export const Route = createFileRoute("/_shop/_profile/profile")({
  component: ProfilePage
});

function ProfilePage() {
  const { data: user, status, error, refetch } = useQuery(meQueryOptions);

  return (
    <PageWrapper
      title="Thông tin tài khoản"
      image="/page-title/page-title-5.jpg"
      breadcrumbItems={[
        { label: "Trang chủ", href: "/" },
        { label: "Tài khoản", href: "/profile" },
        { label: "Chi tiết" }
      ]}
    >
      <div className="container mx-auto px-4 py-12 md:py-20">
        <QueryBoundary data={user} status={status} error={error} onRetry={() => refetch()}>
          {(me) => (
            <div className="flex flex-col gap-8 md:flex-row md:gap-12">
              {/* Sidebar */}
              <ProfileNavigation user={me} />

              {/* Main Form Content */}
              <main className="flex-1">
                <div className="bg-card rounded-xl border p-6 shadow-sm md:p-10">
                  <header className="mb-8">
                    <h4 className="text-2xl font-bold tracking-tight">Cập nhật tài khoản</h4>
                    <p className="text-muted-foreground text-sm">
                      Thông tin này sẽ được sử dụng để liên lạc và giao hàng.
                    </p>
                  </header>

                  {/* Separate Form Component */}
                  <ProfileForm user={me} />
                </div>
              </main>
            </div>
          )}
        </QueryBoundary>
      </div>
    </PageWrapper>
  );
}

/**
 * Navigation Item Helper for the Sidebar
 */
function ProfileNavItem({
  to,
  icon,
  label,
  active,
  className
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <li>
      <Link
        to={to}
        className={cn(
          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
          "hover:bg-accent hover:text-accent-foreground",
          active ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground",
          className
        )}
      >
        {icon}
        <span className="flex-1">{label}</span>
      </Link>
    </li>
  );
}
