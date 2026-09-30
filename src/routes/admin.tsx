import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { AdminLoading } from "@/components/admin/admin-loading";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { meQueryOptions } from "@/lib/tanstack/options/auth";

export const Route = createFileRoute("/admin")({
  component: AdminLayout
});

function AdminLayout() {
  const { data: me, isLoading } = useQuery(meQueryOptions);

  if (isLoading) {
    return <AdminLoading />;
  }

  if (!me || me.role !== "admin") {
    return <AdminAccessDenied />;
  }

  return (
    <SidebarProvider className="bg-muted/20 flex h-screen">
      <AdminSidebar />
      <SidebarInset className="flex flex-1 flex-col overflow-hidden bg-transparent">
        {/* Modern Sticky Header */}
        <header className="flex h-16 shrink-0 items-center justify-between px-6 transition-all">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <AdminBreadcrumb />
          </div>
        </header>

        {/* Main Content Area with rounded canvas effect */}
        <main className="flex-1 overflow-hidden px-4 pb-4">
          <div className="bg-background h-full w-full overflow-hidden rounded-3xl border shadow-sm">
            <ScrollArea className="h-full w-full">
              <div className="p-6 md:p-8">
                <Outlet />
              </div>
            </ScrollArea>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
