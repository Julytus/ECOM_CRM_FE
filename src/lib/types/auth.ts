import type { ApiResponse, MessageResponse, Prettify } from "@/lib/types/common";

type LoginWithEmail = {
  email: string;
  phone?: never;
  plainPassword: string;
};

type LoginWithPhone = {
  phone: string;
  email?: never;
  plainPassword: string;
};

export type LoginApiRequest = LoginWithEmail | LoginWithPhone;

export interface LoginResponseDTO {
  token: string;
  // refreshToken: string;
  // userId: number;
}

export interface LoginApiResponse {
  code: number;
  message: string;
  result: LoginResponseDTO;
}

export interface SignupApiRequest {
  name: string;
  email: string;
  phone: string;
  plainPassword: string;
}

export type SignupApiResponse = Prettify<ApiResponse<MessageResponse>>;

export interface MeDTO {
  id: number;
  name: string;
  phone: string;
  password: string | null;
  plainPassword: string | null;
  avatar: string | null;
  email: string;
  role: "user" | "admin";
  active: boolean;
  username: string;
}

export type MeApiResponse = Prettify<ApiResponse<MeDTO>>;
