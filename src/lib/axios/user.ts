import axiosInstance from "@/lib/axios/instance";
import type { MessageResponse } from "@/lib/types/common";
import type {
  UserListApiRequest,
  UserListApiResponse,
  UserDetailsApiRequest,
  UserDetailsApiResponse,
  GetMeApiResponse,
  UserDTO,
  ChangePasswordApiRequest,
  UpdateUserInfoRequest
} from "@/lib/types/user";

export const getInfiniteUsers = async (filters: UserListApiRequest) => {
  const response = await axiosInstance.get<UserListApiResponse>("/user/list", {
    params: {
      keyword: filters.keyword,
      status: filters.status,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
      page: filters.paging?.page,
      limit: filters.paging?.limit
    }
  });

  return response.data.result;
};

export const getUserDetails = async (params: UserDetailsApiRequest) => {
  const response = await axiosInstance.get<UserDetailsApiResponse>(`/user/details/${params.id}`);

  return response.data.result;
};

export const getMe = async (): Promise<GetMeApiResponse["result"]> => {
  const response = await axiosInstance.get<GetMeApiResponse>("/user/info");
  return response.data.result;
};

export const createUser = async (user: Omit<UserDTO, "id">) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: UserDTO;
  }>("/user/update", user);

  return response.data.result;
};

export const updateUser = async (user: UserDTO) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: UserDTO;
  }>("/user/update", user);

  return response.data.result;
};

export const deleteUser = async (id: number) => {
  const response = await axiosInstance.delete<{
    code: number;
    message: string;
    result: number;
  }>(`/user/delete/${id}`);

  return response.data.result;
};

export const getUserById = async (id: number) => {
  const response = await axiosInstance.get<{
    code: number;
    message: string;
    result: UserDTO;
  }>("/user/getById", {
    params: { id }
  });

  return response.data.result;
};

export const changePassword = async (
  payload: ChangePasswordApiRequest
): Promise<MessageResponse> => {
  const { data } = await axiosInstance.post("/me/change-password", payload);
  return data;
};

export const updateUserInfo = async (payload: UpdateUserInfoRequest): Promise<MessageResponse> => {
  const { data } = await axiosInstance.post("/me/update", payload);
  return data;
};

export const setUserActive = async (id: number, active: boolean) => {
  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: string;
  }>(`/user/${id}/active`, null, {
    params: { active }
  });

  return response.data.result;
};
