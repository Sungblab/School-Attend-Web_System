import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import * as Device from 'expo-device';
import {
  Text,
  Button,
  List,
  Surface,
  Divider,
  ActivityIndicator,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, SIZES } from "../theme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { getDeviceId, clearDeviceId } from "../utils/deviceId";
import axios from "../utils/axios";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deviceStatus, setDeviceStatus] = useState("미등록");

  useEffect(() => {
    loadDeviceInfo();
    checkDeviceStatus();
  }, []);

  const loadDeviceInfo = async () => {
    try {
      const id = await getDeviceId();
      setDeviceId(id);
    } catch (error) {
      console.error("디바이스 정보 로드 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkDeviceStatus = async () => {
    try {
      const id = await getDeviceId();
      if (!id) {
        setDeviceStatus("미등록");
        return;
      }

      const deviceInfo = {
        model: Device.modelName || 'unknown',
        type: Device.deviceType || 'unknown',
        platform: Platform.OS,
        isDevice: Device.isDevice,
      };

      setDeviceStatus("등록됨");
    } catch (error) {
      console.error("디바이스 상태 확인 중 오류:", error);
      setDeviceStatus("확인 불가");
    }
  };

  const handleUnregisterDevice = async () => {
    Alert.alert(
      "디바이스 등록 해제",
      "이 기기의 등록을 해제하시겠습니까?\n해제 후 다시 로그인해야 합니다.",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "해제",
          onPress: async () => {
            try {
              if (!deviceId) {
                throw new Error("디바이스 ID를 찾을 수 없습니다.");
              }

              console.log('Sending device ID:', deviceId); // 디버깅용

              const response = await axios.delete("/api/device", {
                data: { 
                  deviceId,
                  deviceInfo: {
                    model: Device.modelName || 'unknown',
                    platform: Platform.OS,
                    version: Platform.Version,
                    isDevice: Device.isDevice
                  }
                }
              });

              if (response.data.success) {
                await clearDeviceId();
                Alert.alert(
                  "알림",
                  "디바이스가 해제되었습니다. 다시 로그인해주세요."
                );
                await logout();
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              }
            } catch (error) {
              console.error("디바이스 해제 중 오류:", error);
              Alert.alert(
                "오류", 
                error.response?.data?.message || "디바이스 해제 중 오류가 발생했습니다."
              );
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "로그아웃",
        onPress: async () => {
          try {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (error) {
            Alert.alert("오류", "로그아웃 중 오류가 발생했습니다.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const menuItems = [
    {
      title: "학번",
      subtitle: user?.studentId,
      icon: "card-account-details",
    },
    {
      title: "이름",
      subtitle: user?.name,
      icon: "account",
    },
    {
      type: "divider",
    },
    {
      title: "비밀번호 변경",
      icon: "lock-reset",
      onPress: () => setPasswordModalVisible(true),
      color: COLORS.primary,
    },
    {
      title: "로그아웃",
      icon: "logout",
      onPress: handleLogout,
      color: COLORS.error,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Icon name="account-circle" size={80} color={COLORS.primary} />
          <Text variant="headlineMedium" style={styles.name}>
            {user?.name}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            계정 정보 및 보안
          </Text>
          <Surface style={styles.card} elevation={1}>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                {item.type === "divider" ? (
                  <Divider style={styles.divider} />
                ) : (
                  <>
                    {index > 0 && !menuItems[index - 1].type && (
                      <Divider style={styles.divider} />
                    )}
                    <TouchableOpacity
                      style={styles.listItem}
                      onPress={item.onPress}
                      disabled={!item.onPress}
                    >
                      <Icon
                        name={item.icon}
                        size={24}
                        color={item.color || COLORS.primary}
                        style={styles.icon}
                      />
                      {item.subtitle ? (
                        <View style={styles.textRow}>
                          <Text style={styles.listTitle}>{item.title}</Text>
                          <Text style={styles.listSubtitle}>
                            {item.subtitle}
                          </Text>
                        </View>
                      ) : (
                        <Text
                          style={[
                            styles.actionButtonText,
                            item.color === COLORS.error &&
                              styles.logoutButtonText,
                          ]}
                        >
                          {item.title}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </React.Fragment>
            ))}
          </Surface>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            디바이스 관리
          </Text>
          <Surface style={styles.card} elevation={1}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : (
              <View style={styles.deviceContainer}>
                <View style={styles.deviceHeader}>
                  <View style={styles.deviceIconContainer}>
                    <Icon name="cellphone" size={32} color={COLORS.primary} />
                  </View>
                  <View style={styles.deviceHeaderInfo}>
                    <Text style={styles.deviceTitle}>현재 기기</Text>
                    <View style={styles.statusContainer}>
                      <View style={styles.statusDot} />
                      <Text style={styles.deviceStatus}>등록됨</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.unregisterButton}
                  onPress={handleUnregisterDevice}
                >
                  <Icon
                    name="cellphone-remove"
                    size={18}
                    color={COLORS.error}
                    style={styles.smallIcon}
                  />
                  <Text style={styles.unregisterText}>이 기기의 등록 해제</Text>
                </TouchableOpacity>
                <Text style={styles.deviceNote}>
                  * 등록 해제 시 다시 로그인해야 합니다
                </Text>
              </View>
            )}
          </Surface>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            앱 정보
          </Text>
          <Surface style={styles.card} elevation={1}>
            <View style={styles.listItem}>
              <Icon
                name="information"
                size={24}
                color={COLORS.primary}
                style={styles.icon}
              />
              <Text style={styles.listTitle}>버전</Text>
              <Text style={styles.listSubtitle}>1.0.0</Text>
            </View>
          </Surface>
        </View>
      </ScrollView>

      <ChangePasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: wp("5%"),
    marginTop: hp("5%"),
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: hp("3%"),
  },
  name: {
    fontFamily: FONTS.koreanBold,
    color: COLORS.text,
    marginTop: hp("1%"),
    fontSize: SIZES.xl * 1.2,
  },
  section: {
    marginBottom: hp("3%"),
  },
  sectionTitle: {
    fontFamily: FONTS.koreanBold,
    color: COLORS.text,
    marginBottom: hp("1.5%"),
    marginLeft: wp("1%"),
    fontSize: SIZES.xl,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp("1.8%"),
    paddingHorizontal: wp("4%"),
  },
  icon: {
    marginRight: wp("3%"),
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  listTitle: {
    fontFamily: FONTS.koreanMedium,
    color: COLORS.text,
    fontSize: SIZES.md,
    width: wp("15%"),
  },
  listSubtitle: {
    fontFamily: FONTS.korean,
    color: COLORS.text,
    fontSize: SIZES.md,
    flex: 1,
  },
  divider: {
    backgroundColor: "#F3F4F6",
    height: 1,
  },
  actionButtonText: {
    fontFamily: FONTS.koreanMedium,
    color: COLORS.primary,
    fontSize: SIZES.md,
    flex: 1,
  },
  logoutButtonText: {
    fontFamily: FONTS.koreanMedium,
    color: COLORS.error,
    fontSize: SIZES.md,
    flex: 1,
  },
  loadingContainer: {
    padding: hp("2%"),
    alignItems: "center",
  },
  deviceContainer: {
    padding: hp("2%"),
  },
  deviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  deviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
  },
  deviceHeaderInfo: {
    flex: 1,
  },
  deviceTitle: {
    fontFamily: FONTS.koreanBold,
    fontSize: SIZES.lg,
    color: COLORS.text,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  deviceStatus: {
    fontFamily: FONTS.korean,
    fontSize: SIZES.sm,
    color: COLORS.primary,
  },
  unregisterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error + "15",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: "center",
  },
  unregisterText: {
    fontFamily: FONTS.koreanMedium,
    fontSize: SIZES.sm,
    color: COLORS.error,
  },
  smallIcon: {
    marginRight: 6,
  },
  deviceNote: {
    fontFamily: FONTS.korean,
    fontSize: SIZES.xs,
    color: COLORS.grey,
    textAlign: "center",
  },
});
