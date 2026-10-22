import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { AlertCircle, Home } from "lucide-react";

export function AdminAccessDenied() {
  return (
    <div className="bg-muted/30 flex min-h-[60vh] items-center justify-center rounded-xl p-6">
      <Card className="bg-background shadow-foreground/5 w-full max-w-lg rounded-3xl border-0 shadow-xl">
        <CardContent className="flex flex-col items-center gap-8 py-12 text-center">
          <div className="bg-destructive/10 text-destructive flex h-20 w-20 items-center justify-center rounded-full">
            <AlertCircle className="h-10 w-10" />
          </div>
          <div className="space-y-3">
            <h1 className="text-foreground text-4xl font-bold tracking-tight">
              Truy cập bị từ chối
            </h1>
            <p className="text-muted-foreground text-lg">
              Bạn không có quyền xem trang này. <br />
              Vui lòng liên hệ bộ phận hỗ trợ nếu đây là một sai sót.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Về Trang Chủ
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
