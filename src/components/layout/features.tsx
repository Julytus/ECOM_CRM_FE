"use client";

import { Package, ArrowDownLeft, LifeBuoy, Percent } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: <Package size={32} />,
      title: "Giao hàng nhanh & miễn phí",
      description: "Không phí phát sinh, giá hiển thị là giá bạn nhận."
    },
    {
      icon: <ArrowDownLeft size={32} />,
      title: "Đổi trả 14 ngày",
      description: "Mua sắm không rủi ro với chính sách đổi trả dễ dàng."
    },
    {
      icon: <LifeBuoy size={32} />,
      title: "Hỗ trợ 24/7",
      description: "Luôn sẵn sàng để hỗ trợ bạn bất cứ lúc nào."
    },
    {
      icon: <Percent size={32} />,
      title: "Ưu đãi thành viên",
      description: "Giá đặc biệt cho khách hàng thân thiết."
    }
  ];

  return (
    <section
      aria-label="Cam kết dịch vụ"
      className="flat-spacing-2 from-background to-muted/60 bg-gradient-to-b py-12 md:py-16"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24">
        <ul role="list" className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <li
              key={idx}
              className="bg-card text-card-foreground border-border flex flex-col items-center rounded-2xl border p-4 text-center shadow-xs transition-shadow duration-300 hover:shadow-md sm:p-6"
            >
              <div
                aria-hidden="true"
                className="bg-muted text-foreground mb-4 flex size-14 items-center justify-center rounded-full [&_svg]:size-6"
              >
                {feature.icon}
              </div>
              <h3 className="mb-1.5 font-sans text-sm font-semibold sm:text-base">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
