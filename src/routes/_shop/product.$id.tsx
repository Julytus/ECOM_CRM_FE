"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Box, Heart, RefreshCcw, Share2, ShoppingCart, Truck, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { QueryBoundary } from "@/components/boundary";
import { ImageGallery } from "@/components/image/image-gallery";
import { ProductImageGalleryScroll } from "@/components/shop/product/product-image-gallery-scroll";
import { PageWrapper } from "@/components/layout/page-warper";
import { MotionButton } from "@/components/motion-ui";
import { ActionGroup } from "@/components/shop/action-group";
import { ProductPriceDisplay } from "@/components/shop/product/product-price-display";
import { InfoFeature } from "@/components/shop/product/info-feature";
import { ProductHeader } from "@/components/shop/product/product-header";
import { ProductReviews } from "@/components/shop/product/product-review";
import { SizeGuide } from "@/components/shop/product/size-guide";
import { VariantPicker } from "@/components/shop/product/variant-picker";
import { QuantityInput } from "@/components/shop/quantity-input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { normalizeImages } from "@/lib/format";
import { useCartStore } from "@/lib/stores/cart";
import { createProductDetailsQueryOptions } from "@/lib/tanstack/options/product";
import {
  createAddToWishlistMutationOptions,
  createRemoveFromWishlistMutationOptions,
  createWishlistQueryOptions
} from "@/lib/tanstack/options/wishlist";
import type { ProductDetailsDTO } from "@/lib/types/product";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_shop/product/$id")({
  component: ProductDetailsPage
});

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
} as const;

function ProductDetailsPage() {
  const { id } = Route.useParams();
  const { data: product, status } = useQuery(createProductDetailsQueryOptions({ id }));

  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>({});
  const [quantity, setQuantity] = React.useState(1);
  const addToCart = useCartStore((state) => state.addToCart);
  const navigate = useNavigate();

  const { data: wishlist } = useQuery(createWishlistQueryOptions());
  const isFavorited = wishlist?.some((item) => item.productId === product?.id) ?? false;

  const addToWishList = useMutation({
    ...createAddToWishlistMutationOptions()
  });
  const removeFromWishList = useMutation({
    ...createRemoveFromWishlistMutationOptions()
  });
  const isWishlistPending = addToWishList.isPending || removeFromWishList.isPending;

  const handleToggleWishlist = () => {
    if (isWishlistPending || !product) return;

    if (isFavorited) {
      removeFromWishList.mutate({ productId: product.id });
    } else {
      addToWishList.mutate({ productId: product.id });
    }
  };

  React.useEffect(() => {
    if (!product) return;

    const initial: Record<string, string> = {};
    product.attributes.forEach((attribute) => {
      initial[attribute.fieldName] = attribute.options[0]?.value ?? "";
    });
    setSelectedOptions(initial);
  }, [product]);

  // Chỉ chọn variant khi tất cả thuộc tính đã có giá trị và khớp hoàn toàn.
  const activeVariant = React.useMemo(() => {
    if (!product) return undefined;

    const hasAllOptions = product.attributes.every((attribute) =>
      Boolean(selectedOptions[attribute.fieldName])
    );
    if (!hasAllOptions) return undefined;

    return product.variants.find((variant) =>
      product.attributes.every(
        (attribute) => variant.options[attribute.fieldName] === selectedOptions[attribute.fieldName]
      )
    );
  }, [product, selectedOptions]);

  // Đưa ảnh của variant đang chọn lên đầu để ImageGallery hiển thị làm ảnh chính.
  const images = React.useMemo(() => {
    if (!product) return [];

    const candidates = [
      activeVariant?.image,
      product.thumbnail,
      ...normalizeImages(product.image),
      ...product.variants.map((variant) => variant.image)
    ];

    return Array.from(
      new Set(
        candidates.filter((url): url is string => typeof url === "string" && url.trim().length > 0)
      )
    );
  }, [product, activeVariant]);

  const isOutOfStock =
    !product?.variants?.length || product.variants.every((variant) => variant.stock <= 0);
  const canBuy = Boolean(activeVariant && activeVariant.stock > 0);

  // Khi đổi variant, không giữ quantity lớn hơn tồn kho của variant mới.
  React.useEffect(() => {
    const stock = activeVariant?.stock ?? 0;
    setQuantity((current) => {
      if (stock <= 0) return 1;
      return Math.min(Math.max(current, 1), stock);
    });
  }, [activeVariant?.id, activeVariant?.stock]);

  const handleBuyNow = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!activeVariant || activeVariant.stock <= 0) return;

    addToCart(activeVariant.productId, activeVariant.id, 1, activeVariant.stock);
    navigate({ to: "/checkout" });
  };

  const handleAddToCart = () => {
    if (!activeVariant || activeVariant.stock <= 0) return;

    addToCart(activeVariant.productId, activeVariant.id, quantity, activeVariant.stock);
    toast.success("Đã thêm sản phẩm vào giỏ hàng");
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Xem sản phẩm này: ${product?.name}`,
          url
        });
      } catch {
        // Người dùng có thể đóng hộp thoại chia sẻ.
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Đã copy link sản phẩm 📋");
    }
  };

  return (
    <PageWrapper
      theme="minimal"
      headerVariant="luxury"
      headerSize="compact"
      headerAlignment="left"
      breadcrumbItems={[
        { label: "Home", href: "/" },
        { label: "Collection", href: "/search" },
        { label: product?.name || "Đang tải" }
      ]}
    >
      <QueryBoundary data={product} status={status} loadingFallback={<ProductDetailsSkeleton />}>
        {(loadedProduct) => (
          <>
            <div className="container mx-auto px-4 pb-12 sm:px-6 md:pb-16 lg:px-8">
              <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-12 lg:gap-16">
                {/* Gallery */}
                <div className="lg:col-span-7">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="overflow-hidden"
                  >
                    <ProductImageGalleryScroll
                      // Remount khi đổi variant để tự chọn ảnh variant ở đầu danh sách.
                      key={activeVariant?.id ?? "no-active-variant"}
                      images={images}
                      alt={loadedProduct.name}
                      aspectRatio={4 / 5}
                    />
                  </motion.div>
                </div>

                {/* Product info */}
                <div className="lg:col-span-5">
                  <div className="flex flex-col space-y-7 lg:sticky lg:top-32 lg:space-y-8">
                    <motion.div
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      <ProductHeader
                        as="h1"
                        brand="OAKLYN"
                        name={loadedProduct.name}
                        rating={loadedProduct.avgRating ?? 0}
                        reviewCount={124}
                        status={isOutOfStock ? "outOfStock" : "inStock"}
                      />

                      <div className="flex flex-col gap-2">
                        <ProductPriceDisplay
                          currentPrice={activeVariant?.price ?? 0}
                          originalPrice={activeVariant?.originalPrice ?? 0}
                          className="text-2xl tracking-tight md:text-3xl"
                        />

                        <p
                          aria-live="polite"
                          className={cn(
                            "text-sm font-medium",
                            !activeVariant
                              ? "text-muted-foreground"
                              : activeVariant.stock > 0
                                ? "text-success"
                                : "text-sale"
                          )}
                        >
                          {!activeVariant
                            ? "Vui lòng chọn đầy đủ thuộc tính sản phẩm"
                            : activeVariant.stock > 0
                              ? `Còn ${activeVariant.stock} sản phẩm`
                              : "Sản phẩm này đã hết hàng"}
                        </p>
                      </div>
                    </motion.div>

                    <Separator />

                    {/* Variant selection */}
                    <motion.div
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.1 }}
                      className="space-y-6"
                    >
                      {loadedProduct.attributes.map((attribute) => (
                        <VariantPicker
                          key={attribute.id}
                          label={attribute.name}
                          variant={
                            attribute.fieldName.toLowerCase() === "color" ? "swatch" : "button"
                          }
                          value={selectedOptions[attribute.fieldName]}
                          options={attribute.options}
                          onChange={(value) => {
                            setSelectedOptions((previous) => ({
                              ...previous,
                              [attribute.fieldName]: value
                            }));
                          }}
                          className="luxury-picker"
                          renderHeaderRight={
                            attribute.fieldName.toLowerCase() === "size" && <SizeGuide />
                          }
                        />
                      ))}

                      <div className="space-y-3">
                        <QuantityInput
                          value={quantity}
                          onQuantityChange={(nextQuantity) => {
                            const maxStock = activeVariant?.stock ?? 0;
                            if (maxStock <= 0) {
                              setQuantity(1);
                              return;
                            }
                            setQuantity(Math.min(Math.max(1, nextQuantity), maxStock));
                          }}
                          maxStock={activeVariant?.stock ?? 0}
                          roundness="sm"
                          size="default"
                        />
                      </div>
                    </motion.div>

                    {/* Actions */}
                    <ActionGroup layout="stack" gap="default" className="pt-2" staggerDelay={0.12}>
                      <ActionGroup layout="split" gap="compact" animate={false}>
                        <MotionButton
                          type="button"
                          onClick={handleAddToCart}
                          disabled={!canBuy}
                          whileTap={{ scale: 0.98 }}
                          className="h-12 w-full rounded-xl text-xs font-semibold tracking-[0.14em] uppercase md:h-14"
                        >
                          <ShoppingCart aria-hidden="true" className="size-4" />
                          Thêm vào giỏ hàng
                        </MotionButton>

                        <MotionButton
                          type="button"
                          onClick={handleBuyNow}
                          disabled={!canBuy}
                          variant="outline"
                          whileTap={{ scale: 0.98 }}
                          className="group border-foreground hover:bg-foreground hover:text-background dark:border-foreground dark:hover:bg-foreground h-12 w-full rounded-xl bg-transparent text-xs font-semibold tracking-[0.14em] uppercase md:h-14 dark:bg-transparent"
                        >
                          <Zap
                            aria-hidden="true"
                            className="group-hover:fill-warning group-hover:text-warning size-4 fill-transparent transition-colors"
                          />
                          Mua ngay
                        </MotionButton>
                      </ActionGroup>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          onClick={handleToggleWishlist}
                          variant="ghost"
                          disabled={isWishlistPending}
                          aria-pressed={isFavorited}
                          className={cn(
                            "group h-11 w-full text-xs font-medium",
                            isFavorited ? "text-sale hover:text-sale" : "text-muted-foreground"
                          )}
                        >
                          <Heart
                            aria-hidden="true"
                            className={cn(
                              "size-4 transition-transform duration-300 motion-reduce:transition-none",
                              isFavorited
                                ? "fill-sale text-sale scale-110"
                                : "group-hover:text-sale group-hover:scale-110"
                            )}
                          />
                          {isFavorited ? "Đã yêu thích" : "Yêu thích"}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleShare}
                          className="text-muted-foreground h-11 w-full text-xs font-medium"
                        >
                          <Share2 aria-hidden="true" className="size-4" />
                          Chia sẻ
                        </Button>
                      </div>
                    </ActionGroup>

                    {/* Trust features */}
                    <div className="border-border bg-card grid grid-cols-1 gap-5 rounded-2xl border p-5 sm:p-6">
                      <InfoFeature
                        icon={Truck}
                        title="Giao hàng miễn phí"
                        subtitle="Cho tất cả đơn hàng trên 10.000.000đ"
                        theme="neutral"
                      />
                      <InfoFeature
                        icon={Box}
                        title="Đóng gói độc quyền"
                        subtitle="Sản phẩm được đặt trong hộp thủ công cao cấp"
                        theme="neutral"
                      />
                      <InfoFeature
                        icon={RefreshCcw}
                        title="Đổi trả trong 30 ngày"
                        subtitle="Quy trình đổi trả nhanh chóng, tận nơi"
                        theme="neutral"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ProductDetailsSection product={loadedProduct} images={images} />
            <ProductReviews productId={loadedProduct.id} avgRating={loadedProduct.avgRating ?? 0} />
          </>
        )}
      </QueryBoundary>
    </PageWrapper>
  );
}

function ProductDetailsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Đang tải sản phẩm"
      className="container mx-auto grid grid-cols-1 gap-8 px-4 pb-16 sm:px-6 md:gap-12 lg:grid-cols-12 lg:gap-16 lg:px-8"
    >
      <Skeleton className="aspect-4/5 w-full rounded-xl lg:col-span-7" />
      <div className="space-y-6 lg:col-span-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-px w-full" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="size-9 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-12 w-36" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Skeleton className="h-12 rounded-xl md:h-14" />
          <Skeleton className="h-12 rounded-xl md:h-14" />
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: "description", label: "Mô tả sản phẩm" },
  { id: "details", label: "Thông số chi tiết" },
  { id: "shipping", label: "Giao hàng & Trả hàng" }
];

export function ProductDetailsSection({
  product,
  images
}: {
  product: ProductDetailsDTO;
  images?: string[];
}) {
  const [activeTab, setActiveTab] = React.useState("description");

  return (
    <section className="bg-background border-border border-t py-16 md:py-24">
      <div className="container mx-auto px-4">
        <Tabs defaultValue="description" className="mx-auto max-w-5xl" onValueChange={setActiveTab}>
          <TabsList className="border-border relative mb-10 flex h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b bg-transparent p-0 [scrollbar-width:none] sm:justify-center sm:gap-12 md:mb-16 [&::-webkit-scrollbar]:hidden">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="group text-muted-foreground hover:text-foreground data-[state=active]:text-foreground focus-visible:ring-ring/60 relative flex-none rounded-none border-none bg-transparent px-0 pb-4 text-xs font-semibold tracking-[0.18em] uppercase shadow-none transition-colors focus-visible:ring-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none md:pb-5 dark:data-[state=active]:bg-transparent"
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="bg-foreground absolute right-0 bottom-0 left-0 h-0.5"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            >
              <TabsContent value="description" className="mt-0 focus-visible:outline-none">
                <div className="mx-auto max-w-2xl text-center">
                  <span className="text-muted-foreground mb-4 block text-xs font-medium tracking-[0.3em] uppercase">
                    Câu chuyện sản phẩm
                  </span>
                  <p className="text-foreground/90 font-serif text-xl leading-relaxed italic md:text-2xl">
                    {product.description || "Chưa có mô tả cho sản phẩm này."}
                  </p>
                </div>
                {images && images.length > 0 && (
                  <>
                    <Separator />
                    <ImageGallery
                      className="py-6"
                      images={images}
                      layout="bento"
                      bentoPattern="feature"
                    />
                  </>
                )}
              </TabsContent>

              <TabsContent value="details" className="mt-0 focus-visible:outline-none">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-24">
                  <div className="space-y-10">
                    <div>
                      <h4 className="text-foreground mb-5 font-sans text-xs font-semibold tracking-[0.18em] uppercase">
                        Chất liệu &amp; Chế tác
                      </h4>
                      <div className="space-y-1">
                        {[
                          {
                            label: "Chất liệu bề mặt",
                            value: "Da Calfskin nguyên tấm (Ý)"
                          },
                          {
                            label: "Lớp lót nội thất",
                            value: "Lụa Satin dệt thủ công"
                          },
                          {
                            label: "Phần cứng",
                            value: "Thép không gỉ mạ vàng 18K"
                          },
                          {
                            label: "Phương pháp khâu",
                            value: "Khâu tay thủ công (Saddle Stitch)"
                          }
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="group border-border hover:border-foreground flex items-end justify-between gap-4 border-b py-4 transition-colors"
                          >
                            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                              {item.label}
                            </span>
                            <span className="text-foreground text-right text-sm font-medium">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div>
                      <h4 className="text-foreground mb-5 font-sans text-xs font-semibold tracking-[0.18em] uppercase">
                        Kích thước &amp; Trọng lượng
                      </h4>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="border-border border-l-2 pl-4">
                          <span className="text-muted-foreground block text-[11px] font-semibold tracking-wide uppercase">
                            Rộng x Cao x Sâu
                          </span>
                          <span className="text-foreground text-lg font-light tabular-nums">
                            25 x 18 x 10{" "}
                            <small className="text-muted-foreground ml-1 text-xs">cm</small>
                          </span>
                        </div>
                        <div className="border-border border-l-2 pl-4">
                          <span className="text-muted-foreground block text-[11px] font-semibold tracking-wide uppercase">
                            Trọng lượng tịnh
                          </span>
                          <span className="text-foreground text-lg font-light tabular-nums">
                            0.85 <small className="text-muted-foreground ml-1 text-xs">kg</small>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/60 rounded-xl p-6">
                      <div className="flex gap-4">
                        <div aria-hidden="true" className="bg-border h-10 w-px shrink-0" />
                        <p className="text-foreground/80 text-sm leading-relaxed italic">
                          “Mỗi sản phẩm là duy nhất. Những vết hằn tự nhiên trên da không phải là
                          lỗi, mà là minh chứng cho nguồn gốc hữu cơ và tính độc bản của chất liệu.”
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="shipping" className="mt-0 focus-visible:outline-none">
                <div className="mx-auto max-w-xl space-y-6 text-center">
                  <p className="text-foreground/85 text-sm leading-loose">
                    Mỗi sản phẩm được chế tác theo đơn đặt hàng để đảm bảo tính độc bản. Vui lòng
                    chờ 7-14 ngày làm việc để chúng tôi hoàn thiện và giao tận tay bạn.
                  </p>
                  <button
                    type="button"
                    className="border-foreground text-foreground hover:text-muted-foreground hover:border-muted-foreground focus-visible:ring-ring/60 border-b pb-1 text-xs font-semibold tracking-widest uppercase transition-colors outline-none focus-visible:ring-2"
                  >
                    Tìm hiểu thêm về chính sách vận chuyển
                  </button>
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </section>
  );
}
