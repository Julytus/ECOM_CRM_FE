import * as React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AdjustmentValues = { points: number; rankDelta: number; reason: string };

export function AdjustDialog({ open, onOpenChange, pending, onConfirm }: {
  open: boolean; onOpenChange: (open: boolean) => void; pending: boolean; onConfirm: (values: AdjustmentValues) => void;
}) {
  const [points, setPoints] = React.useState("");
  const [rankDelta, setRankDelta] = React.useState("0");
  const [reason, setReason] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const values = { points: Number(points), rankDelta: Number(rankDelta), reason: reason.trim() };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!Number.isInteger(values.points) || !Number.isInteger(values.rankDelta)) return setError("Điểm điều chỉnh phải là số nguyên.");
    if (values.points === 0 && values.rankDelta === 0) return setError("Điểm và điểm xếp hạng không thể cùng bằng 0.");
    if (!values.reason) return setError("Vui lòng nhập lý do điều chỉnh.");
    setError("");
    setConfirmOpen(true);
  };

  return <>
    <FormDialog open={open} onOpenChange={onOpenChange} title="Điều chỉnh điểm" featured="Nhập thay đổi điểm và lý do. Thao tác sẽ cần xác nhận." submitLabel="Tiếp tục" isLoading={pending} onSubmit={submit}>
      <div className="space-y-2"><Label htmlFor="adjust-points">Điểm cộng/trừ</Label><Input id="adjust-points" type="number" step="1" value={points} onChange={(event) => setPoints(event.target.value)} required /></div>
      <div className="space-y-2"><Label htmlFor="adjust-rank">Điểm xếp hạng thay đổi</Label><Input id="adjust-rank" type="number" step="1" value={rankDelta} onChange={(event) => setRankDelta(event.target.value)} required /></div>
      <div className="space-y-2"><Label htmlFor="adjust-reason">Lý do</Label><Input id="adjust-reason" value={reason} onChange={(event) => setReason(event.target.value)} required /></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </FormDialog>
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Xác nhận điều chỉnh điểm?</AlertDialogTitle><AlertDialogDescription>Thay đổi số dư {values.points > 0 ? "+" : ""}{values.points.toLocaleString("vi-VN")} điểm và điểm xếp hạng {values.rankDelta > 0 ? "+" : ""}{values.rankDelta.toLocaleString("vi-VN")}. Lý do: {values.reason}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={pending}>Hủy</AlertDialogCancel><AlertDialogAction disabled={pending} onClick={() => { setConfirmOpen(false); onConfirm(values); }}>Xác nhận</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
    </AlertDialog>
  </>;
}
