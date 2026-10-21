import { CartSheet } from "@/components/layout/cart/cart-sheet";
import { Footer } from "@/components/layout/footer";
import { Navigation } from "@/components/layout/navigation";
import { QuickViewSheet } from "@/components/layout/product/product-quickview";
import { SearchDialog } from "@/components/layout/product/search-dialog";
import { Topbar } from "@/components/layout/topbar";
import { FloatingChat } from "@/components/shop/chat";
import { quickViewProductIdAtom } from "@/lib/atom/quickview";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { MotionConfig } from "motion/react";

export const Route = createFileRoute("/_shop")({ component: ShopLayout });

function ShopLayout() {
  // const location = useLocation();

  const [selectedProductId, setSelectedProductId] = useAtom(quickViewProductIdAtom);
  return (
    // reducedMotion="user": every motion/react animation in the shop honours prefers-reduced-motion.
    <MotionConfig reducedMotion="user">
      <div className="bg-background text-foreground h-full w-full overflow-x-hidden">
        <a
          href="#shop-content"
          className="focus-visible:ring-ring bg-primary text-primary-foreground sr-only z-[1000] rounded-md px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus-visible:ring-2 focus-visible:outline-none"
        >
          Bỏ qua tới nội dung chính
        </a>
        <Topbar />
        <Navigation />
        <div id="shop-content" tabIndex={-1} className="outline-none">
          <Outlet />
        </div>
        <FloatingChat />
        <SearchDialog />
        <CartSheet />
        <QuickViewSheet
          productId={selectedProductId}
          open={!!selectedProductId}
          onOpenChange={(open) => !open && setSelectedProductId(null)}
        />
        <Footer />
      </div>
    </MotionConfig>
  );
}
