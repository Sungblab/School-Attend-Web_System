import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Device from "expo-device";
import { encode as btoa } from 'base-64';

const DEVICE_ID_KEY = "device_id";

export const generateDeviceId = async () => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
      const deviceInfo = {
        brand: Device.brand || "unknown",
        model: Device.modelName || "unknown",
        osName: Platform.OS,
        osVersion: Platform.Version,
        type: Device.deviceType || "unknown",
        isDevice: Device.isDevice,
        timestamp: new Date().getTime(),
      };

      const deviceInfoStr = JSON.stringify(deviceInfo);
      deviceId = btoa(deviceInfoStr);
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error("디바이스 ID 생성 중 오류:", error);
    throw error;
  }
};

export const getDeviceId = async () => {
  try {
    return await AsyncStorage.getItem(DEVICE_ID_KEY);
  } catch (error) {
    console.error("디바이스 ID 조회 중 오류:", error);
    throw error;
  }
};

export const clearDeviceId = async () => {
  try {
    await AsyncStorage.removeItem(DEVICE_ID_KEY);
  } catch (error) {
    console.error("디바이스 ID 삭제 중 오류:", error);
    throw error;
  }
};
