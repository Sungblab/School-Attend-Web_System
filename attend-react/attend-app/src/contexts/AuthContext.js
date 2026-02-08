import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../utils/axios";
import { clearDeviceId } from "../utils/deviceId";
import { Platform } from "react-native";
import * as Device from "expo-device";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userInfo = await AsyncStorage.getItem("user");
      
      if (token && userInfo) {
        try {
          // 저장된 사용자 정보 복원
          setUser(JSON.parse(userInfo));
          
          // 토큰 유효성 검사를 위해 student-info API 요청
          await axios.get("/api/student-info");
        } catch (error) {
          // API 요청이 실패하면 토큰이 유효하지 않은 것으로 간주
          console.error("토큰 검증 실패:", error);
          await logout();
        }
      }
    } catch (error) {
      console.error("인증 확인 중 오류:", error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (studentId, password, deviceId) => {
    try {
      const deviceInfo = {
        deviceId,
        isEmulator: !Device.isDevice,
        model: Device.modelName || 'unknown',
        platform: Platform.OS,
        version: Platform.Version,
      };

      const response = await axios.post("/api/login", {
        studentId,
        password,
        deviceInfo,
        keepLoggedIn: true,
      });

      if (response.data.success) {
        await AsyncStorage.multiSet([
          ["token", response.data.accessToken],
          ["user", JSON.stringify(response.data.user)]
        ]);
        setUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      console.error("로그인 중 오류:", error);
      throw error.response?.data || { message: "로그인 중 오류가 발생했습니다." };
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/logout");
      await AsyncStorage.multiRemove(["token", "user"]);
      await clearDeviceId();
      setUser(null);
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
      await AsyncStorage.multiRemove(["token", "user"]);
      await clearDeviceId();
      setUser(null);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
