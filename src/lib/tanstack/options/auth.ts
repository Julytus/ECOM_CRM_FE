import { getMe, login, signup } from "@/lib/axios/auth";
import type {
  LoginApiRequest,
  LoginResponseDTO,
  SignupApiRequest,
  SignupApiResponse
} from "@/lib/types/auth";
import type { ErrorResponse } from "@/lib/types/common";
import { queryOptions, type MutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const createLoginMutationOptions = (): MutationOptions<
  LoginResponseDTO,
  AxiosError<ErrorResponse>,
  LoginApiRequest
> => {
  return {
    mutationKey: ["login"],
    mutationFn: async (data: LoginApiRequest) => {
      return await login(data);
    },
    meta: {
      successMessage: "Đăng nhập thành công",
      invalidatesQuery: [["me"]]
    }
  };
};

export const createSignupMutationOptions = (): MutationOptions<
  SignupApiResponse["result"],
  AxiosError<ErrorResponse>,
  SignupApiRequest
> => {
  return {
    mutationKey: ["signup"],
    mutationFn: (data: SignupApiRequest) => signup(data),
    meta: {
      successMessage: "Đăng ký thành công"
    }
  };
};

export const meQueryOptions = queryOptions({
  queryKey: ["me"],
  queryFn: getMe,
  staleTime: 0,
  gcTime: 0
});
