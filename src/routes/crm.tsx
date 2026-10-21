import { createFileRoute, Outlet } from "@tanstack/react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CrmSidebar } from "@/components/crm/sidebar/crm-sidebar";
import { CrmUser } from "@/components/crm/sidebar/crm-user";
import { useQuery } from "@tanstack/react-query";
import { meQueryOptions } from "@/lib/tanstack/options/auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminLoading } from "@/components/crm/crm-loading";
import { ThemeToggle } from "@/components/layout/theme/theme-toggle";

export const Route = createFileRoute("/crm")({
  component: CrmLayout
});

function CrmLayout() {
  const { data: me, isLoading } = useQuery(meQueryOptions);

  if (isLoading) {
    return <AdminLoading />;
  }

  return (
    <SidebarProvider>
      <CrmSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Build Your Application</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <ThemeToggle />
            <CrmUser
              user={{
                name: me?.name ?? "Unknown",
                email: me?.email ?? "unknown@example.com",
                avatar:
                  me?.avatar ?? `https://ui-avatars.com/api/?name=${me?.name}&background=random`,
                roleName: me?.roleName ?? "Unknown"
              }}
            />
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
