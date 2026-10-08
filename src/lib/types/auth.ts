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

  isOperator: number | null;

  branchId: number | null;
  branchName: string | null;

  roleId: number | null;
  roleName: string | null;

  name: string;
  alias: string | null;

  avatar: string | null;

  phone: string | null;
  phoneVerified: number | null;

  email: string | null;

  facebookId: string | null;
  gplusId: string | null;

  password: string | null;
  plainPassword: string | null;
  hasPassword: number | null;

  regisDate: string | null;

  newPassword: string | null;
  retypeNewPassword: string | null;

  active: number | null;

  firstTime: number | null;
  time: number | null;

  token: string | null;

  cityName: string | null;
  subdistrictName: string | null;
  gender: number | null;

  otp: string | null;
  idToken: string | null;

  deviceId: string | null;
  actionType: string | null;

  type: "login" | "register" | string | null;
}

export type MeApiResponse = Prettify<ApiResponse<MeDTO>>;
