import axiosInstance from "@/lib/axios/instance";

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post<{
    code: number;
    message: string;
    result: string;
  }>("/file/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data.result;
};
