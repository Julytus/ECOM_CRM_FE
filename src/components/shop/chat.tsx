import * as React from "react";
import {
  ArrowUp,
  ChevronRight,
  CircleHelp,
  Crown,
  MessageCircle,
  RotateCcw,
  Sparkles,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  searchProduct,
  type ChatTurn,
  type ProductData,
  type ProductRecommendation
} from "@/lib/axios/chat";
import { ImageWithFallback } from "@/components/image/image-with-fallback";
import { Link } from "@tanstack/react-router";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content?: string;
  recommendations?: ProductRecommendation[];
  timestamp: Date;
  suggestions?: string[];
};

const QUICK_PROMPTS = [
  { label: "Tìm theo ngân sách", message: "Tư vấn sản phẩm phù hợp với ngân sách của tôi" },
  { label: "Sản phẩm nổi bật", message: "Gợi ý cho tôi những sản phẩm nổi bật đáng mua" },
  { label: "Tìm giá tốt", message: "Tìm sản phẩm có giá tốt" }
];

const formatVND = (amount?: number | null) => {
  if (amount == null || Number.isNaN(Number(amount))) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(amount);
};

const getProductImage = (product: ProductData) => {
  if (!product.image) return product.thumbnail ?? "";
  try {
    const parsed: unknown = JSON.parse(product.image);
    if (Array.isArray(parsed) && typeof parsed[0] === "string")
      return parsed[0] || product.thumbnail || "";
    if (typeof parsed === "string") return parsed;
  } catch {
    return product.image || product.thumbnail || "";
  }
  return product.thumbnail ?? "";
};

const ProductRecommendationCard = ({
  item,
  index
}: {
  item: ProductRecommendation;
  index: number;
}) => {
  const product = item.product;
  const imageUrl = React.useMemo(() => getProductImage(product), [product]);

  return (
    <article className="group mt-3 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid grid-cols-[108px_minmax(0,1fr)] gap-3 p-3">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-stone-100 dark:bg-zinc-800">
          <ImageWithFallback
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[9px] font-semibold text-stone-700 shadow-sm">
            <Sparkles className="h-3 w-3 text-amber-500" /> Gợi ý {index + 1}
          </span>
        </div>
        <div className="flex min-w-0 flex-col py-1">
          <p className="mb-1 text-[9px] font-semibold tracking-[0.14em] text-stone-400 uppercase">
            Concierge lựa chọn
          </p>
          <h4 className="line-clamp-2 text-sm leading-5 font-semibold text-stone-900 dark:text-stone-100">
            {product.name}
          </h4>
          <p className="mt-2 text-base font-bold tracking-tight text-stone-950 dark:text-white">
            {formatVND(product.minPrice)}
          </p>
          <p className="mt-2 line-clamp-3 text-[10px] leading-4 text-stone-500 dark:text-zinc-400">
            {item.reason}
          </p>
          <div className="mt-auto pt-3">
            <Link
              to="/product/$id"
              params={{ id: String(product.id) }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-stone-700 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
            >
              Xem chi tiết <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

const TypingIndicator = () => (
  <div className="flex items-end gap-2.5" aria-live="polite">
    <Avatar className="h-7 w-7 shrink-0 border border-stone-200 dark:border-zinc-700">
      <AvatarFallback className="bg-stone-950 text-white dark:bg-white dark:text-stone-950">
        <Crown className="h-3.5 w-3.5" />
      </AvatarFallback>
    </Avatar>
    <div className="rounded-2xl rounded-bl-md border border-stone-100 bg-white px-3.5 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500 [animation-delay:-0.25s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500 [animation-delay:-0.12s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500" />
        <span className="ml-1 text-[10px] text-stone-500 dark:text-zinc-400">
          Đang tìm lựa chọn phù hợp…
        </span>
      </div>
    </div>
  </div>
);

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(date);

export const FloatingChat = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPrompts, setShowPrompts] = React.useState(true);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Xin chào, rất vui được đồng hành cùng bạn. ✨\n\nMình có thể giúp bạn tìm sản phẩm phù hợp, cân đối ngân sách hoặc khám phá những lựa chọn đáng cân nhắc. Bạn đang tìm gì hôm nay?",
      timestamp: new Date()
    }
  ]);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector<HTMLElement>(
      "[data-radix-scroll-area-viewport]"
    );
    if (!viewport) return;
    const frame = window.requestAnimationFrame(() =>
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" })
    );
    return () => window.cancelAnimationFrame(frame);
  }, [messages, isLoading, isOpen]);

  const sendMessage = async (rawText = input) => {
    const text = rawText.trim();
    if (!text || isLoading) return;

    const history: ChatTurn[] = messages
      .filter((message) => message.content)
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: [
          message.content!,
          ...(message.recommendations ?? []).map(
            (item) =>
              `Sản phẩm đã gợi ý: ${item.product.name}, giá ${formatVND(item.product.minPrice)}. Lý do: ${item.reason}`
          )
        ].join("\n")
      }));

    setInput("");
    setShowPrompts(false);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text, timestamp: new Date() }
    ]);
    setIsLoading(true);

    try {
      const response = await searchProduct(text, history);
      const recommendations: ProductRecommendation[] =
        response.type === "PRODUCTS"
          ? response.data
          : response.type === "PRODUCT"
            ? [
                {
                  product: response.data,
                  reason: "Một lựa chọn đáng cân nhắc theo yêu cầu của bạn."
                }
              ]
            : [];

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            response.message ||
            (recommendations.length
              ? "Mình đã tìm được một vài lựa chọn cho bạn."
              : "Mình có thể giúp bạn tìm sản phẩm phù hợp hơn."),
          recommendations,
          suggestions: response.suggestions,
          timestamp: new Date()
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Xin lỗi bạn, hiện mình chưa kết nối được với hệ thống tư vấn. Bạn vui lòng thử lại sau ít phút nhé.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const resetConversation = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Chào bạn trở lại! Mình có thể giúp bạn tìm sản phẩm, cân đối ngân sách hoặc so sánh các lựa chọn. Bạn muốn bắt đầu từ đâu?",
        timestamp: new Date()
      }
    ]);
    setInput("");
    setShowPrompts(true);
  };

  return (
    <div className="fixed right-5 bottom-5 z-50 flex flex-col items-end gap-3 font-sans sm:right-6 sm:bottom-6">
      {isOpen && (
        <Card className="animate-in slide-in-from-bottom-3 fade-in-0 flex h-[min(690px,calc(100dvh-112px))] w-[calc(100vw-32px)] max-w-[390px] flex-col overflow-hidden rounded-[26px] border border-stone-200/80 bg-[#faf9f6] p-0 shadow-[0_24px_90px_rgba(28,25,23,0.22)] duration-300 dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="relative overflow-hidden border-0 bg-stone-950 px-5 py-4 text-white dark:bg-zinc-900">
            <div className="pointer-events-none absolute -top-12 -right-8 h-36 w-36 rounded-full border border-white/10" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative">
                  <Avatar className="h-11 w-11 border border-white/20">
                    <AvatarFallback className="bg-gradient-to-br from-amber-200 to-amber-500 text-stone-950">
                      <Crown className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-stone-950 bg-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate text-sm font-semibold tracking-wide">
                      Personal Concierge
                    </h3>
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-[10px] text-white/65">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Trợ lý tư vấn sản phẩm
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Cuộc trò chuyện mới"
                  title="Cuộc trò chuyện mới"
                  onClick={resetConversation}
                  className="h-8 w-8 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Đóng tư vấn"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="relative mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-300" />
              <p className="text-[10px] leading-4 text-white/75">
                Tư vấn theo nhu cầu của bạn, không chỉ đơn thuần tìm kiếm.
              </p>
            </div>
          </CardHeader>

          <CardContent className="min-h-0 flex-1 bg-[#faf9f6] p-0 dark:bg-zinc-950">
            <ScrollArea className="h-full px-4 py-5" ref={scrollAreaRef}>
              <div className="space-y-5">
                <div className="text-center">
                  <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-[9px] font-medium tracking-wide text-stone-400 dark:border-zinc-800 dark:bg-zinc-900">
                    CUỘC TRÒ CHUYỆN CỦA BẠN
                  </span>
                </div>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex flex-col",
                      message.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "flex max-w-[96%] items-end gap-2",
                        message.role === "user" && "flex-row-reverse"
                      )}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="mb-5 h-7 w-7 shrink-0 border border-stone-200 dark:border-zinc-700">
                          <AvatarFallback className="bg-stone-950 text-white dark:bg-white dark:text-stone-950">
                            <Crown className="h-3.5 w-3.5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="min-w-0 flex-1">
                        {message.content && (
                          <div
                            className={cn(
                              "rounded-2xl px-3.5 py-3 text-[12px] leading-[1.7] whitespace-pre-line shadow-sm",
                              message.role === "user"
                                ? "rounded-br-md bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950"
                                : "rounded-bl-md border border-stone-200/70 bg-white text-stone-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                            )}
                          >
                            {message.content}
                          </div>
                        )}
                        {message.recommendations?.map((item, index) => (
                          <ProductRecommendationCard
                            key={`${item.product.id}-${index}`}
                            item={item}
                            index={index}
                          />
                        ))}
                        <div
                          className={cn(
                            "mt-1.5 text-[9px] text-stone-400",
                            message.role === "user" ? "text-right" : "text-left"
                          )}
                        >
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                    {message.role === "assistant" &&
                      message.suggestions &&
                      message.suggestions.length > 0 && (
                        <div className="mt-2 ml-9 flex max-w-[calc(100%-36px)] flex-wrap gap-1.5">
                          {message.suggestions.slice(0, 3).map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              disabled={isLoading}
                              onClick={() => void sendMessage(suggestion)}
                              className="rounded-full border border-stone-200 bg-white px-2.5 py-1.5 text-left text-[10px] font-medium text-stone-600 transition hover:border-stone-400 hover:bg-stone-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
                {showPrompts && (
                  <div className="pl-9">
                    <p className="mb-2.5 text-[10px] font-medium text-stone-500 dark:text-zinc-400">
                      Bạn có thể bắt đầu bằng cách
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_PROMPTS.map((prompt) => (
                        <button
                          key={prompt.label}
                          type="button"
                          disabled={isLoading}
                          onClick={() => void sendMessage(prompt.message)}
                          className="rounded-full border border-stone-200 bg-white px-3 py-2 text-left text-[10px] font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                        >
                          {prompt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {isLoading && <TypingIndicator />}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="block border-t border-stone-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950">
            <form
              className="relative flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-1.5 pl-3 transition focus-within:border-stone-400 focus-within:ring-2 focus-within:ring-stone-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-within:ring-zinc-700"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Chia sẻ điều bạn đang tìm…"
                aria-label="Tin nhắn tư vấn"
                disabled={isLoading}
                className="h-9 min-w-0 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                aria-label="Gửi tin nhắn"
                className="h-9 w-9 shrink-0 rounded-xl bg-stone-950 text-white transition hover:bg-stone-700 disabled:bg-stone-300 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </form>
            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[9px] text-stone-400">
              <CircleHelp className="h-3 w-3" />
              <span>Chia sẻ ngân sách và nhu cầu để nhận gợi ý sát hơn</span>
            </div>
          </CardFooter>
        </Card>
      )}
      <Button
        type="button"
        aria-label={isOpen ? "Đóng cửa sổ tư vấn" : "Mở tư vấn sản phẩm"}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "group relative h-14 w-14 rounded-full border border-white/15 shadow-[0_10px_35px_rgba(28,25,23,0.3)] transition-all duration-300 hover:scale-105",
          isOpen
            ? "bg-white text-stone-950 hover:bg-stone-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
            : "bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
        )}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <span className="absolute inset-0 rounded-full bg-amber-300/15 opacity-0 transition-opacity group-hover:opacity-100" />
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-amber-400 text-[8px] font-bold text-stone-950">
              <Sparkles className="h-2 w-2" />
            </span>
          </>
        )}
      </Button>
    </div>
  );
};
