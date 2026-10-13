"use client";

import { ImageWithFallback } from "@/components/image/image-with-fallback";
import { CartButton } from "@/components/layout/cart/cart-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { searchOpenAtom } from "@/lib/atom/search";
import { meQueryOptions } from "@/lib/tanstack/options/auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { Heart, Search, User, LogOut, Settings, LayoutDashboard } from "lucide-react";

export function Navigation() {
  const [, setSearchOpen] = useAtom(searchOpenAtom);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const { data: me } = useQuery(meQueryOptions);

  const handleOpenSearch = () => {
    if (isMobile) {
      navigate({ to: "/search" });
      return;
    }
    setSearchOpen(true);
  };

  return (
    <div className="border-border bg-background sticky top-0 z-40 w-full border-b shadow-sm">
      <div className="relative container mx-auto flex h-20 items-center justify-end px-4">
        {/* Center Logo */}
        <Link
          to="/"
          className="absolute left-4 flex items-center transition-opacity hover:opacity-90 md:left-1/2 md:-translate-x-1/2"
        >
          <ImageWithFallback
            src="/oaklyn.png"
            alt="Oaklyn logo"
            className="h-14 w-auto scale-150 brightness-90 contrast-150 saturate-150 transition-transform md:h-16"
          />
        </Link>

        {/* Right Icons */}
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={handleOpenSearch}>
            <Search className="h-5 w-5" />
          </Button>

          {me ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative" size="icon">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={me.avatar || ""} alt={me.name} />
                    <AvatarFallback>
                      {me?.name?.slice(0, 2).toUpperCase() ?? "U"}
                    </AvatarFallback>{" "}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="center" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">{me.name}</p>
                    <p className="text-muted-foreground text-xs leading-none">{me.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {me.isOperator === 1 && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/crm" })}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Bảng điều khiển</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => navigate({ to: "/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="icon" variant="ghost">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Link to="/wishlist">
            <Button size="icon" variant="ghost">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          <CartButton variant="danger" />
        </div>
      </div>
    </div>
  );
}
