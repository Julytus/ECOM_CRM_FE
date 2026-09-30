import { ThemeProvider } from "@/components/layout/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { createRootRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const RootLayout = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);
  return (
    <>
      <ThemeProvider defaultTheme="light" storageKey="oaklyn-ui-theme">
        <main className="bg-background text-foreground flex h-screen w-full flex-col overflow-y-scroll">
          <Outlet />
          <Toaster />
        </main>
      </ThemeProvider>
      {/* <TanStackRouterDevtools /> */}
    </>
  );
};

function Page404() {
  const navigate = useNavigate();

  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Card className="bg-background max-w-lg rounded-3xl border-0 p-12 shadow-lg">
        <CardContent className="space-y-6">
          {/* 404 Title */}
          <h1 className="text-6xl leading-tight font-bold md:text-7xl">404</h1>

          {/* Description */}
          <p className="text-muted-foreground text-lg md:text-xl">
            Trang bạn đang tìm kiếm không tồn tại. <br />
            Hãy thử khám phá các không gian được tuyển chọn của chúng tôi!
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-center">
            <Button onClick={() => navigate({ to: "/" })} size="lg" className="rounded-full">
              Về Trang Chủ
            </Button>

            <Button
              onClick={() => navigate({ to: "/search" })}
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              Khám Phá Sản Phẩm
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Optional decorative background */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 -z-10">
        <svg
          className="mx-auto w-full max-w-2xl opacity-10"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="hsl(var(--primary))"
            fillOpacity="0.1"
            d="M0,160L80,170.7C160,181,320,203,480,213.3C640,224,800,224,960,224C1120,224,1280,224,1360,224L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          />
        </svg>
      </div>
    </main>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: Page404
});
