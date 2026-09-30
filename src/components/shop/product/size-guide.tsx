"use client";

import * as React from "react";
import { Ruler, Info, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export function SizeGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="text-muted-foreground hover:text-foreground h-auto p-0 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors"
        >
          <Ruler className="mr-2 size-3.5" />
          Bảng size
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl gap-0 overflow-hidden border-0 p-0 shadow-2xl sm:rounded-xl">
        <DialogHeader className="p-6 pb-4 md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <DialogTitle className="flex items-center gap-3 text-base font-bold tracking-[0.1em] uppercase">
              <div className="bg-primary text-primary-foreground rounded-lg p-2">
                <Ruler className="size-5" />
              </div>
              Hướng dẫn chọn kích thước
            </DialogTitle>
            <div className="bg-secondary text-secondary-foreground flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold tracking-tighter whitespace-nowrap uppercase">
              Đơn vị: Inches
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 md:px-8">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px] font-bold">Size</TableHead>
                <TableHead className="text-center font-bold">Width</TableHead>
                <TableHead className="text-center font-bold">Depth</TableHead>
                <TableHead className="text-right font-bold">Height</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SIZE_DATA.map((row) => (
                <TableRow key={row.size}>
                  <TableCell className="font-black">{row.size}</TableCell>
                  <TableCell className="text-muted-foreground text-center">{row.width}</TableCell>
                  <TableCell className="text-muted-foreground text-center">{row.depth}</TableCell>
                  <TableCell className="text-muted-foreground text-right">{row.height}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-muted/20 mt-6 grid grid-cols-1 divide-y border-y md:grid-cols-3 md:divide-x md:divide-y-0">
          <MeasureItem title="Width" desc="Chiều ngang tổng thể của sản phẩm." />
          <MeasureItem title="Depth" desc="Chiều sâu từ trước ra sau." />
          <MeasureItem title="Height" desc="Chiều cao từ mặt đất lên đỉnh sản phẩm." />
        </div>

        <div className="bg-muted/50 flex items-center gap-3 p-6">
          <Info className="text-muted-foreground size-4 shrink-0" />
          <p className="text-muted-foreground text-[11px] italic">
            <strong>Lưu ý:</strong> Kích thước có thể chênh lệch 1–2 inches do sai số đo thủ công.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MeasureItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="space-y-1.5 p-5">
      <h5 className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
        <MapPin className="text-primary size-3" /> {title}
      </h5>
      <p className="text-muted-foreground text-[11px] leading-snug">{desc}</p>
    </div>
  );
}

const SIZE_DATA = [
  { size: "Small", width: "55", depth: "30", height: "32" },
  { size: "Standard", width: "65", depth: "35", height: "34" },
  { size: "Large", width: "75", depth: "40", height: "36" }
];
