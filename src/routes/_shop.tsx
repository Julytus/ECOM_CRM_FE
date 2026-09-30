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

export const Route = createFileRoute("/_shop")({ component: ShopLayout });

function ShopLayout() {
  // const location = useLocation();

  const [selectedProductId, setSelectedProductId] = useAtom(quickViewProductIdAtom);
  return (
    <div className="h-full w-full overflow-x-hidden">
      <Topbar />
      <Navigation />
      {/* <div className="h-full w-full overflow-x-hidden"> */}
      <Outlet />
      <FloatingChat />
      <SearchDialog />
      <CartSheet />
      <QuickViewSheet
        productId={selectedProductId}
        open={!!selectedProductId}
        onOpenChange={(open) => !open && setSelectedProductId(null)}
      />
      <Footer />
      {/* </div> */}
    </div>
  );
}
