import axios, { type AxiosRequestConfig, AxiosResponse } from "axios";

interface ApiProps {
  url?: string;
  formData?: Record<string, any> | FormData;
  method?: "get" | "post" | "put" | "delete" | "patch";
  token?: string;
  responseType?: "json" | "blob" | "text" | "arraybuffer";
  headers?: Record<string, string>;
}

async function Api({
  url = "/",
  formData = {},
  method = "get",
  token = "",
  responseType = "json",
  headers = {},
}: ApiProps): Promise<AxiosResponse | { error: boolean; message: string; status?: number }> {
  try {
    const isFormData = typeof FormData !== "undefined" && formData instanceof FormData;

    const config: AxiosRequestConfig = {
      method,
      url,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      responseType,
    };

    if (method !== "get") {
      config.data = formData;
    }

    const response: AxiosResponse = await axios(config);
    return response;
  } catch (error: any) {
    console.error("Error during API call:", error);

    if (error.response) {
      return {
        error: true,
        message: error.response.data?.message || "An error occurred",
        status: error.response.status,
      };
    }

    return { error: true, message: "Network error or server not reachable" };
  }
}

export default Api;
