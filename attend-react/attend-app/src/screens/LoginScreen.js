import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, SIZES } from "../theme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import { generateDeviceId } from "../utils/deviceId";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [formData, setFormData] = useState({
    studentId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    initDeviceId();
  }, []);

  const initDeviceId = async () => {
    try {
      const id = await generateDeviceId();
      setDeviceId(id);
    } catch (error) {
      console.error("디바이스 ID 초기화 중 오류:", error);
      Alert.alert("오류", "디바이스 초기화에 실패했습니다.");
    }
  };

  const handleLogin = async () => {
    if (!deviceId) {
      Alert.alert("오류", "디바이스 초기화가 완료되지 않았습니다.");
      return;
    }

    if (!formData.studentId || !formData.password) {
      Alert.alert("오류", "학번과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const response = await login(
        formData.studentId,
        formData.password,
        deviceId
      );
      if (response.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      } else {
        Alert.alert("로그인 실패", response.message);
      }
    } catch (error) {
      console.error("로그인 중 오류:", error);
      Alert.alert(
        "로그인 실패",
        error.response?.data?.message || "로그인에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Icon name="qrcode-scan" size={40} color={COLORS.primary} />
              </View>
              <Text variant="headlineMedium" style={styles.title}>
                디지털 출결
              </Text>
              <Text style={styles.subtitle}>간편하고 스마트한 출결 관리</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                mode="outlined"
                label="학번"
                placeholder="학번을 입력하세요"
                left={<TextInput.Icon icon="card-account-details" />}
                value={formData.studentId}
                onChangeText={(text) =>
                  setFormData({ ...formData, studentId: text })
                }
                keyboardType="numeric"
                maxLength={4}
                style={styles.input}
                theme={{
                  roundness: 12,
                }}
              />

              <TextInput
                mode="outlined"
                label="비밀번호"
                placeholder="비밀번호를 입력하세요"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                secureTextEntry={!showPassword}
                style={styles.input}
                theme={{
                  roundness: 12,
                }}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.button}
                labelStyle={styles.buttonText}
              >
                {loading ? "로그인 중..." : "로그인"}
              </Button>
            </View>

            <View style={styles.footer}>
              <Button
                mode="text"
                onPress={() => navigation.navigate("SignUp")}
                labelStyle={styles.linkText}
                style={styles.footerButton}
              >
                회원가입
              </Button>
              <View style={styles.divider} />
              <Button
                mode="text"
                onPress={() => navigation.navigate("ForgotPassword")}
                labelStyle={styles.linkText}
                style={styles.footerButton}
              >
                비밀번호 찾기
              </Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flex: 1,
    padding: wp("5%"),
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: hp("6%"),
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontFamily: FONTS.koreanBold,
    color: COLORS.text,
    marginTop: hp("2%"),
    fontSize: SIZES.xl * 1.1,
  },
  subtitle: {
    fontFamily: FONTS.koreanMedium,
    color: COLORS.grey,
    marginTop: hp("1%"),
    fontSize: SIZES.sm * 1.1,
  },
  form: {
    width: "100%",
    marginBottom: hp("3%"),
  },
  input: {
    marginBottom: hp("1.5%"),
    backgroundColor: "#fff",
    borderRadius: 12,
    fontSize: SIZES.md,
  },
  button: {
    marginTop: hp("2%"),
    paddingVertical: hp("1%"),
    borderRadius: 12,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: "100%",
    alignSelf: "center",
  },
  buttonText: {
    fontFamily: FONTS.koreanBold,
    fontSize: SIZES.md * 1.1,
    paddingVertical: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("3%"),
    paddingHorizontal: wp("3%"),
  },
  footerButton: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: "40%",
    backgroundColor: COLORS.grey,
    opacity: 0.3,
    marginHorizontal: wp("1%"),
  },
  linkText: {
    fontFamily: FONTS.koreanMedium,
    fontSize: SIZES.sm * 1.1,
    color: COLORS.primary,
  },
});
