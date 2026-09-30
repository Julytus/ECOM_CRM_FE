"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Box, Heart, Loader2, RefreshCcw, ShoppingCart, Truck, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { ImageGallery } from "@/components/image/image-gallery";
import { PageWrapper } from "@/components/layout/page-warper";
import { MotionButton } from "@/components/motion-ui";
import { ProductPriceDisplay } from "@/components/shop/product/product-price-display";
import { SizeGuide } from "@/components/shop/product/size-guide";
import { VariantPicker } from "@/components/shop/product/variant-picker";
import { QuantityInput } from "@/components/shop/quantity-input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";

import { QueryBoundary } from "@/components/boundary";
import { ActionGroup } from "@/components/shop/action-group";
import { InfoFeature } from "@/components/shop/product/info-feature";
import { ProductHeader } from "@/components/shop/product/product-header";
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
import { ProductReviews } from "@/components/shop/product/product-review";

export const Route = createFileRoute("/_shop/product/$id")({
  component: ProductDetailsPage
});

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
} as const;

function ProductDetailsPage() {
  const { id } = Route.useParams();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { data: product, status } = useQuery(createProductDetailsQueryOptions({ id }));

  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>({});
  const [quantity, setQuantity] = React.useState(1);
  const addToCart = useCartStore((s) => s.addToCart);

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
    if (product) {
      const initial: Record<string, string> = {};
      product.attributes.forEach((attr) => {
        initial[attr.fieldName] = attr.options[0]?.value || "";
      });
      setSelectedOptions(initial);
    }
  }, [product]);

  const images = [product?.thumbnail, ...normalizeImages(product?.image)].filter(
    Boolean
  ) as string[];
  const activeVariant = product?.variants.find((v) =>
    Object.entries(selectedOptions).every(([key, value]) => v.options[key] === value)
  );

  const isOutOfStock =
    !product?.variants ||
    product.variants.length === 0 ||
    product.variants.every((v) => v.stock <= 0);
  const canBuy = activeVariant && (activeVariant?.stock ?? 0) > 0;

  const navigate = useNavigate();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canBuy) return;
    addToCart(activeVariant.productId, activeVariant.id, 1, activeVariant.stock);
    navigate({ to: "/checkout" });
  };

  const handleAddToCart = () => {
    if (!canBuy) return;
    addToCart(activeVariant.productId, activeVariant.id, quantity, activeVariant.stock);
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
        //
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
        {(product) => (
          <>
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
                {/* LEFT: MINIMALIST GALLERY */}
                <div className="lg:col-span-7">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="overflow-hidden"
                  >
                    <ImageGallery
                      images={images}
                      layout={isMobile ? "carousel" : "featured"}
                      aspectRatio={4 / 5}
                      className="bg-neutral-50"
                    />
                  </motion.div>
                </div>

                {/* RIGHT: ELEGANT PRODUCT INFO */}
                <div className="lg:col-span-5">
                  <div className="sticky top-32 flex flex-col space-y-8">
                    {/* Header Group */}
                    <motion.div
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      <ProductHeader
                        brand="OAKLYN"
                        name={product.name}
                        rating={product.avgRating ?? 0}
                        reviewCount={124}
                        status={isOutOfStock ? "outOfStock" : "inStock"}
                      />

                      <div className="flex items-center gap-4">
                        <ProductPriceDisplay
                          currentPrice={activeVariant?.price ?? 0}
                          originalPrice={activeVariant?.originalPrice ?? 0}
                          className="text-2xl font-light tracking-tight text-neutral-900"
                        />
                      </div>
                    </motion.div>

                    <Separator className="bg-neutral-100" />

                    {/* Selection Group */}
                    <motion.div
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.1 }}
                      className="space-y-8"
                    >
                      {product.attributes.map((attr) => (
                        <VariantPicker
                          key={attr.id}
                          label={attr.name}
                          variant={attr.fieldName.toLowerCase() === "color" ? "swatch" : "button"}
                          value={selectedOptions[attr.fieldName]}
                          options={attr.options}
                          onChange={(val) =>
                            setSelectedOptions((prev) => ({ ...prev, [attr.fieldName]: val }))
                          }
                          className="luxury-picker"
                          renderHeaderRight={
                            attr.fieldName.toLowerCase() === "size" && <SizeGuide />
                          }
                        />
                      ))}

                      <div className="space-y-3">
                        <QuantityInput
                          value={quantity}
                          onQuantityChange={setQuantity}
                          maxStock={activeVariant?.stock ?? 0}
                          roundness="lg"
                          className="rounded-md border-neutral-200"
                          size="default"
                        />
                      </div>
                    </motion.div>

                    {/* Action Group Block */}
                    <ActionGroup layout="stack" gap="luxury" className="pt-6" staggerDelay={0.12}>
                      <ActionGroup layout="split" gap="compact" animate={false}>
                        <MotionButton
                          onClick={handleAddToCart}
                          disabled={!canBuy}
                          whileTap={{ scale: 0.98 }}
                          className="relative h-14 w-full overflow-hidden rounded-xl bg-neutral-900 text-[10px] font-bold tracking-[0.2em] text-white uppercase transition-all hover:bg-neutral-800 disabled:bg-neutral-100"
                        >
                          <ShoppingCart className="mr-2 size-4" />
                          Thêm vào giỏ hàng
                        </MotionButton>

                        <MotionButton
                          onClick={handleBuyNow}
                          disabled={!canBuy}
                          variant="outline"
                          whileTap={{ scale: 0.98 }}
                          className="group h-14 w-full rounded-xl border-neutral-900 bg-transparent text-[10px] font-bold tracking-[0.2em] text-neutral-900 uppercase transition-all hover:bg-neutral-900 hover:text-white"
                        >
                          <Zap className="mr-2 size-4 fill-transparent transition-colors group-hover:fill-amber-400 group-hover:text-amber-400" />
                          Mua ngay
                        </MotionButton>
                      </ActionGroup>

                      <div className="flex flex-col items-center gap-4">
                        <Button
                          onClick={handleToggleWishlist}
                          variant="ghost"
                          className={cn(
                            "group h-10 w-full text-[9px] font-bold tracking-[0.25em] uppercase transition-all",
                            isFavorited
                              ? "text-red-500"
                              : "text-neutral-400 hover:bg-transparent hover:text-black"
                          )}
                        >
                          <Heart
                            className={cn(
                              "mr-2 size-3.5 transition-all duration-300",
                              isFavorited
                                ? "scale-110 fill-red-500 text-red-500"
                                : "group-hover:scale-110 group-hover:fill-red-500 group-hover:text-red-500"
                            )}
                          />
                          {isFavorited
                            ? "Đã lưu vào danh sách yêu thích"
                            : "Thêm vào danh sách yêu thích"}
                        </Button>

                        {/* Đường kẻ mảnh trang trí phong cách Editorial */}
                        <div className="h-px w-12 bg-neutral-200" />

                        <button
                          onClick={handleShare}
                          className="text-[9px] font-medium tracking-widest text-neutral-400 uppercase transition-colors hover:text-black"
                        >
                          Chia sẻ sản phẩm này
                        </button>
                      </div>
                    </ActionGroup>

                    {/* Luxury Trust Icons */}
                    <div className="grid grid-cols-1 gap-8 border-t border-neutral-100 pt-10">
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

            <ProductDetailsSection product={product} images={images} />
            <ProductReviews productId={product.id} avgRating={product.avgRating ?? 0} />
          </>
        )}
      </QueryBoundary>
    </PageWrapper>
  );
}

function ProductDetailsSkeleton() {
  return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <Loader2 className="text-muted-foreground size-8 animate-spin" />
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
    <section className="bg-background border-t border-neutral-100 py-32">
      <div className="container mx-auto px-4">
        <Tabs defaultValue="description" className="mx-auto max-w-5xl" onValueChange={setActiveTab}>
          {/* Tabs Navigation */}
          <TabsList className="relative mb-20 flex h-auto w-full justify-center gap-12 border-b border-neutral-100 bg-transparent p-0">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="group relative rounded-none border-none bg-transparent px-0 pb-6 text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase transition-colors data-[state=active]:text-neutral-900"
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute right-0 bottom-0 left-0 h-0.5 bg-neutral-900"
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
                  <span className="mb-4 block text-[10px] font-medium tracking-[0.5em] text-neutral-400 uppercase">
                    Câu chuyện sản phẩm
                  </span>
                  <p className="font-serif text-xl leading-relaxed text-neutral-800 italic md:text-2xl">
                    "{product.description}"
                  </p>
                </div>
                {images && (
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
                <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:gap-24">
                  {/* Cột 1: Thông số kỹ thuật chính */}
                  <div className="space-y-10">
                    <div>
                      <h4 className="mb-6 text-[11px] font-bold tracking-[0.2em] text-neutral-900 uppercase">
                        Chất liệu & Chế tác
                      </h4>
                      <div className="space-y-1">
                        {[
                          { label: "Chất liệu bề mặt", value: "Da Calfskin nguyên tấm (Ý)" },
                          { label: "Lớp lót nội thất", value: "Lụa Satin dệt thủ công" },
                          { label: "Phần cứng", value: "Thép không gỉ mạ vàng 18K" },
                          { label: "Phương pháp khâu", value: "Khâu tay thủ công (Saddle Stitch)" }
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="group flex items-end justify-between border-b border-neutral-100 py-4 transition-colors hover:border-neutral-900"
                          >
                            <span className="text-[10px] font-medium tracking-widest text-neutral-400 uppercase group-hover:text-neutral-500">
                              {item.label}
                            </span>
                            <span className="text-sm font-medium text-neutral-900">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cột 2: Kích thước & Trọng lượng hoặc Điểm nhấn thiết kế */}
                  <div className="space-y-10">
                    <div>
                      <h4 className="mb-6 text-[11px] font-bold tracking-[0.2em] text-neutral-900 uppercase">
                        Kích thước & Trọng lượng
                      </h4>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="border-l border-neutral-200 pl-4">
                          <span className="block text-[9px] font-bold tracking-tighter text-neutral-400 uppercase">
                            Rộng x Cao x Sâu
                          </span>
                          <span className="text-lg font-light text-neutral-900">
                            25 x 18 x 10 <small className="ml-1 text-[10px]">cm</small>
                          </span>
                        </div>
                        <div className="border-l border-neutral-200 pl-4">
                          <span className="block text-[9px] font-bold tracking-tighter text-neutral-400 uppercase">
                            Trọng lượng tịnh
                          </span>
                          <span className="text-lg font-light text-neutral-900">
                            0.85 <small className="ml-1 text-[10px]">kg</small>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Box ghi chú đặc biệt (Craftsmanship Note) */}
                    <div className="bg-neutral-50 p-6">
                      <div className="flex gap-4">
                        <div className="h-10 w-px bg-neutral-300" />
                        <p className="text-[11px] leading-relaxed text-neutral-500 italic">
                          "Mỗi sản phẩm là duy nhất. Những vết hằn tự nhiên trên da không phải là
                          lỗi, mà là minh chứng cho nguồn gốc hữu cơ và tính độc bản của chất liệu."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="shipping" className="mt-0 focus-visible:outline-none">
                <div className="mx-auto max-w-xl space-y-6 text-center">
                  <p className="text-sm leading-loose font-light text-neutral-600">
                    Mỗi sản phẩm được chế tác theo đơn đặt hàng để đảm bảo tính độc bản. Vui lòng
                    chờ 7-14 ngày làm việc để chúng tôi hoàn thiện và giao tận tay bạn.
                  </p>
                  <button className="border-b border-neutral-900 pb-1 text-[10px] font-bold tracking-widest uppercase transition-colors hover:border-neutral-500 hover:text-neutral-500">
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
