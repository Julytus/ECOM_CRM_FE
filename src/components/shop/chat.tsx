"use client";

import * as React from "react";
import { Send, X, MessageCircle, Crown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { searchProduct, type ProductData } from "@/lib/axios/chat";
import { ImageWithFallback } from "@/components/image/image-with-fallback";
import { Link } from "@tanstack/react-router";

const formatVND = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(amount);
};

const LuxuryProductCard = ({ product }: { product: ProductData }) => {
  const imageUrl = React.useMemo(() => {
    try {
      const images = JSON.parse(product.image);
      return images[0];
    } catch {
      return product.thumbnail;
    }
  }, [product.image, product.thumbnail]);

  return (
    <div className="group overflow-hidden rounded-sm border border-zinc-100 bg-white transition-all duration-500 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-50">
        <ImageWithFallback
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="space-y-0.5 p-2.5 text-center">
        <h4 className="line-clamp-1 text-[11px] font-semibold tracking-wider text-zinc-800 uppercase dark:text-zinc-200">
          {product.name}
        </h4>
        <p className="text-[13px] font-medium text-zinc-950 dark:text-white">
          {formatVND(product.minPrice)}
        </p>
        <Link to="/product/$id" params={{ id: String(product.id) }}>
          <Button
            variant="outline"
            size="sm"
            className="mt-1.5 h-7 w-full rounded-none border-zinc-900 text-[9px] font-bold tracking-[0.15em] uppercase transition-all hover:bg-zinc-900 hover:text-white dark:border-zinc-500"
          >
            Chi tiết
          </Button>
        </Link>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-1.5 p-2 text-[11px] font-light text-zinc-400 italic">
    Đang tìm ý tưởng thiết kế...
  </div>
);

export const FloatingChat = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<
    { role: "user" | "bot"; content?: string; product?: ProductData; timestamp: Date }[]
  >([
    {
      role: "bot",
      content:
        "Kính chào Quý khách. Tôi là chuyên gia tư vấn không gian sống. Tôi có thể giúp gì cho Quý khách hôm nay?",
      timestamp: new Date()
    }
  ]);

  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await searchProduct(userMsg);
      if (response.type === "PRODUCT") {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: "Đây là lựa chọn tinh tế nhất dành cho Quý khách:",
            timestamp: new Date()
          },
          { role: "bot", product: response.data, timestamp: new Date() }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: response.message || "Rất tiếc, tôi chưa tìm thấy sản phẩm phù hợp.",
            timestamp: new Date()
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Hệ thống tư vấn đang bận. Quý khách vui lòng đợi trong giây lát.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3 font-sans selection:bg-zinc-200">
      {isOpen && (
        <Card className="animate-in slide-in-from-bottom-4 fade-in-0 flex h-[480px] w-[310px] flex-col overflow-hidden border-none bg-white shadow-[0_15px_50px_rgba(0,0,0,0.1)] transition-all sm:w-[340px] dark:bg-zinc-950">
          <CardHeader className="border-b border-zinc-50 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Avatar className="h-8 w-8 border border-zinc-100 shadow-sm">
                    <AvatarFallback className="bg-zinc-900 text-[10px] text-white">
                      <Crown className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute right-0 bottom-0 h-2 w-2 rounded-full border border-white bg-amber-400" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.1em] text-zinc-900 uppercase dark:text-white">
                    Concierge
                  </h3>
                  <p className="text-[8px] tracking-tight text-zinc-400 uppercase">Trực tuyến</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-full text-zinc-300 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden bg-white p-0 dark:bg-zinc-950">
            <ScrollArea className="h-full px-4 py-5" ref={scrollAreaRef}>
              <div className="space-y-5">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col gap-1.5",
                      msg.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] text-[12px] leading-relaxed",
                        msg.role === "user"
                          ? "rounded-xl rounded-tr-none bg-zinc-900 px-3.5 py-2 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                          : "font-light text-zinc-600 dark:text-zinc-400"
                      )}
                    >
                      {msg.content && <p>{msg.content}</p>}
                    </div>
                    {msg.product && (
                      <div className="w-full max-w-[210px] pt-1">
                        <LuxuryProductCard product={msg.product} />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && <TypingIndicator />}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t border-zinc-50 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="relative flex w-full items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Nhắn gửi yêu cầu của Quý khách..."
                className="h-9 border-none bg-zinc-50 pr-10 pl-3 text-[11px] italic ring-offset-transparent placeholder:text-zinc-300 focus-visible:ring-0 dark:bg-zinc-900"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                variant="ghost"
                size="icon"
                className="absolute right-1 h-7 w-7 text-zinc-900 hover:bg-transparent dark:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      <Button
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full border border-zinc-100 shadow-xl transition-all duration-500",
          isOpen ? "bg-white text-zinc-900" : "bg-zinc-950 text-white hover:bg-zinc-800"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <MessageCircle className="h-4.5 w-4.5" />}
      </Button>
    </div>
  );
};
