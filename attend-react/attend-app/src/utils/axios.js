import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API 기본 URL 설정
const API_BASE_URL =
  "https://port-0-attend-backend-m0tl39wtc3a73922.sel4.cloudtype.app";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("토큰 가져오기 실패:", error);
      return config;
    }
  },
  (error) => {
    console.error("요청 인터셉터 에러:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const { status } = error.response;

      // 토큰 만료 시 처리 (401 에러)
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = await AsyncStorage.getItem("refreshToken");
          if (!refreshToken) {
            throw new Error("리프레시 토큰이 없습니다.");
          }

          const response = await axios.post(
            `${API_BASE_URL}/api/refresh-token`,
            {
              refreshToken,
            }
          );

          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken } =
              response.data;
            await AsyncStorage.setItem("token", accessToken);
            await AsyncStorage.setItem("refreshToken", newRefreshToken);
            axiosInstance.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${accessToken}`;
            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
            return axiosInstance(originalRequest);
          } else {
            throw new Error(response.data.message);
          }
        } catch (refreshError) {
          await AsyncStorage.multiRemove(["token", "refreshToken"]);
          throw refreshError;
        }
      }

      if (error.response.data && error.response.data.message) {
        error.message = error.response.data.message;
      }
    } else if (error.request) {
      console.error("네트워크 에러:", error.request);
      error.message = "서버에 연결할 수 없습니다.";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
