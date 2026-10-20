import type { ResourceInfoDTO } from "@/lib/types/permission";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const ACTIONS = ["VIEW", "ADD", "UPDATE", "DELETE"] as const;

interface PermissionMatrixProps {
  resources: ResourceInfoDTO[];
  isMutating?: boolean;
  onToggle: (resourceId: number, action: string, checked: boolean) => void;
}

export function PermissionMatrix({ resources, isMutating, onToggle }: PermissionMatrixProps) {
  if (resources.length === 0) {
    return <p className="text-muted-foreground text-sm">Không có tài nguyên nào.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tài nguyên</TableHead>
          {ACTIONS.map((action) => (
            <TableHead key={action} className="text-center">
              {action}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {resources.map((resource) => (
          <TableRow key={resource.id}>
            <TableCell>
              <div className="font-medium">{resource.name}</div>
              <div className="text-muted-foreground text-xs">{resource.code}</div>
            </TableCell>
            {ACTIONS.map((action) => {
              // chỉ cho tick action mà resource này tự khai báo hỗ trợ (vd REPORT chỉ có VIEW).
              // Nhưng nếu action đã được cấp từ trước rồi resource bị sửa bỏ hỗ trợ action đó
              // (vd xoá DELETE khỏi resource ở trang Resource), permission tồn đọng (`checked`)
              // vẫn phải cho bỏ tick được — nếu không, quyền thừa không có đường gỡ qua UI.
              const supported = resource.actions.includes(action);
              const checked = resource.permission.actions.includes(action);
              return (
                <TableCell key={action} className="text-center">
                  <Checkbox
                    disabled={(!supported && !checked) || isMutating}
                    checked={checked}
                    onCheckedChange={(value) => onToggle(resource.id, action, value === true)}
                  />
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
