import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function AdminLoading() {
  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center p-6">
      <Card className="bg-background shadow-foreground/5 w-full max-w-md rounded-3xl border-0 shadow-xl">
        <CardContent className="flex flex-col items-center gap-6 py-12">
          <div className="relative flex items-center justify-center">
            <Loader2 className="text-primary h-12 w-12 animate-spin" />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-foreground text-2xl font-bold tracking-tight">
              Đang tải bảng điều khiển
            </h2>
            <p className="text-muted-foreground">Vui lòng đợi trong giây lát...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
