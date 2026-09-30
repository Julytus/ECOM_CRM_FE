import { AxiosError } from "axios";

export interface ErrorResponse {
  code: number;
  message: string;
}

export function ErrorResponseWarper(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data as ErrorResponse;
    return data.message ?? "Đã có lỗi xảy ra";
  }

  if (err instanceof Error) return err.message;

  return "Đã có lỗi xảy ra";
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface PagedResult<T> {
  total: number;
  page: number;
  items: T[];
}

export type Prettify<T> = {
  [K in keyof T]: T[K];
} extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

export type DeleteResponse = Prettify<ApiResponse<number>>;
export type VoidResponse = Prettify<ApiResponse<null>>;
