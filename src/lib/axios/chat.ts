import axiosInstance from "@/lib/axios/instance";

export type ProductData = {
  id: number;
  name: string;
  image?: string | null;
  thumbnail?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  [key: string]: unknown;
};

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type ProductRecommendation = {
  product: ProductData;
  reason: string;
};

export type ChatApiResponse =
  | {
      type: "CHAT";
      message: string;
      suggestions?: string[];
    }
  | {
      type: "NO_RESULT";
      message: string;
      suggestions?: string[];
    }
  | {
      type: "PRODUCTS";
      message: string;
      data: ProductRecommendation[];
      suggestions?: string[];
    }
  // Backward compatibility while older backend instances are still deployed.
  | {
      type: "PRODUCT";
      message?: string;
      data: ProductData;
      suggestions?: string[];
    };

export const searchProduct = async (
  message: string,
  history: ChatTurn[] = []
): Promise<ChatApiResponse> => {
  const res = await axiosInstance.post<ChatApiResponse>("/ai/product/search", {
    message,
    history: history.slice(-10)
  });
  return res.data;
};
