// "use client";

// import * as React from "react";
// import { useAtom } from "jotai";
// import { useQuery } from "@tanstack/react-query";
// import { X, Sparkles, PenTool } from "lucide-react";

// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetDescription
// } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";

// import { productSheetOpenAtom, selectedProductIdAtom } from "./atoms";
// import { createProductDetailsQueryOptions } from "@/lib/tanstack/options/product";
// import { ProductForm } from "@/components/admin/product/product-form";

// export function ProductSheet() {
//   const [open, setOpen] = useAtom(productSheetOpenAtom);
//   const [id] = useAtom(selectedProductIdAtom);

//   const { data, isLoading } = useQuery({
//     ...createProductDetailsQueryOptions({ id: id ?? 0 }),
//     enabled: !!id && open
//   });

//   return (
//     <Sheet open={open} onOpenChange={setOpen}>
//       <SheetContent
//         className={cn(
//           "w-full gap-0 border-l border-stone-200 p-0 sm:max-w-4xl",
//           "flex flex-col bg-stone-50/95 backdrop-blur-xl"
//         )}
//       >
//         {/* Header */}
//         <div className="relative border-b border-stone-200 bg-white/50 px-8 py-10 shadow-sm">
//           <div className="flex items-start justify-between">
//             <div className="space-y-1">
//               <div className="mb-2 flex items-center gap-2">
//                 <span className="flex h-6 items-center justify-center rounded-full bg-emerald-200 px-2 text-[10px] font-bold tracking-[0.2em] uppercase">
//                   OAKLYN Archive
//                 </span>
//                 {id ? (
//                   <span className="text-[10px] font-medium text-stone-400">ID: #{id}</span>
//                 ) : null}
//               </div>

//               <SheetHeader className="space-y-0 text-left">
//                 <SheetTitle className="font-serif text-4xl font-normal tracking-tight text-stone-900">
//                   {id ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
//                 </SheetTitle>
//                 <SheetDescription className="pt-2 font-medium">
//                   {id
//                     ? "Cập nhật thông tin cho sản phẩm đang chọn."
//                     : "Nhập thông tin để tạo sản phẩm mới."}
//                 </SheetDescription>
//               </SheetHeader>
//             </div>

//             {/* <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => setOpen(false)}
//               className="rounded-full text-stone-400 transition-all hover:bg-stone-100 hover:text-stone-900"
//             >
//               <X className="h-5 w-5" />
//             </Button> */}
//           </div>

//           <div className="absolute bottom-0 left-0 h-[2px] w-24 bg-amber-600" />
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto px-8 py-10">
//           {isLoading ? (
//             <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 text-stone-400">
//               <div className="relative">
//                 <div className="h-12 w-12 animate-spin rounded-full border-2 border-stone-200 border-t-amber-600" />
//                 <Sparkles className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-amber-600" />
//               </div>
//               <p className="font-serif text-sm italic">Đang tải dữ liệu sản phẩm...</p>
//             </div>
//           ) : (
//             <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
//               <ProductForm product={data} onClose={() => setOpen(false)} />
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="border-t border-stone-100 bg-white/30 px-8 py-4">
//           <div className="flex items-center justify-between opacity-50">
//             <div className="flex items-center gap-2">
//               <PenTool className="h-3 w-3" />
//               <span className="text-[9px] font-bold tracking-widest text-stone-500 uppercase">
//                 Hệ thống quản lý sản phẩm
//               </span>
//             </div>
//             <span className="text-[9px] font-medium text-stone-400">© 2024</span>
//           </div>
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// }
