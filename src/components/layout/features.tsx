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
    <section className="flat-spacing-2 from-background bg-gradient-to-b to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="text-primary mb-4">{feature.icon}</div>
              <h5 className="mb-2 text-lg font-semibold">{feature.title}</h5>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
