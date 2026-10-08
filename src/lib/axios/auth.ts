import type {
  LoginApiRequest,
  LoginApiResponse,
  MeApiResponse,
  SignupApiRequest,
  SignupApiResponse
} from "@/lib/types/auth";
import axiosInstance from "@/lib/axios/instance";
import axios from "axios";
import { useAuthStore } from "@/lib/stores/auth";

export const login = async (data: LoginApiRequest) => {
  const response = await axiosInstance.post<LoginApiResponse>("/user/authenticate", data);
  return response.data.result;
};

export const signup = async (data: SignupApiRequest) => {
  const response = await axiosInstance.post<SignupApiResponse>("/user/create", data);
  return response.data.result;
};

export const getMe = async () => {
  const response = await axiosInstance.get<MeApiResponse>("/user/info");
  return response.data.result;
};

export const refreshAccessToken = async () => {
  const refreshToken = useAuthStore.getState().refreshToken;

  if (!refreshToken) throw new Error("No refresh token");

  const response = await axios.post("/auth/refresh", { refreshToken });

  const { accessToken, refreshToken: newRefreshToken, userId } = response.data.result;

  useAuthStore.getState().set({
    accessToken,
    refreshToken: newRefreshToken,
    userId
  });

  return accessToken;
};
