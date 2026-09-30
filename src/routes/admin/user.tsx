import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type SortingState,
  type PaginationState,
  type ColumnFiltersState
} from "@tanstack/react-table";

import { DataTable } from "@/components/admin/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RefreshCcw, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import {
  createInfiniteUsersQueryOptions,
  createUpdateUserMutationOptions,
  setUserActiveMutationOptions
} from "@/lib/tanstack/options/user";
import { createUserColumns } from "@/components/admin/user/columns";
import { UserViewSheet } from "@/components/admin/user/user-sheet";
import { type UserDTO } from "@/lib/types/user";

export const Route = createFileRoute("/admin/user")({
  component: AdminUsers
});

function AdminUsers() {
  const queryClient = useQueryClient();

  // Table & Filter States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selection State for Edit
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);

  // Data Fetching
  const { data, refetch, isFetching, isFetchingNextPage } = useInfiniteQuery(
    createInfiniteUsersQueryOptions({
      opts: {
        keyword: keyword || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter === "ACTIVE" ? 1 : 0,
        paging: {
          limit: pagination.pageSize,
          page: pagination.pageIndex + 1
        }
      }
    })
  );

  const users = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const total = useMemo(() => data?.pages[0]?.total ?? 0, [data]);

  // Mutations
  const updateMutation = useMutation({
    ...setUserActiveMutationOptions()
  });

  const columns = useMemo(
    () =>
      createUserColumns({
        onView: (user) => setSelectedUser(user),
        onToggleStatus: (user) => {
          updateMutation.mutate({
            ...user,
            active: !user.active
          });
        }
      }),
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    state: { pagination, sorting, columnFilters },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="container mx-auto space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-muted-foreground text-sm">
            Quản lý tài khoản, phân quyền và thông tin người dùng trong hệ thống.
          </p>
        </div>
      </div>

      <DataTable
        table={table}
        filterable={false}
        toolbarLeft={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute mt-2.5 ml-2 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="h-8 w-[250px] pl-8"
              />
            </div>

            {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Bị khóa</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        }
        toolbarRight={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? `animate-spin` : ``}`} />
              Làm mới
            </Button>
          </div>
        }
      />

      <UserViewSheet
        user={selectedUser}
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      />

      {isFetching && !isFetchingNextPage && (
        <div className="bg-background fixed right-4 bottom-4 z-50 flex items-center rounded-md border p-2 text-xs shadow-lg">
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          Đang tải dữ liệu...
        </div>
      )}
    </div>
  );
}
