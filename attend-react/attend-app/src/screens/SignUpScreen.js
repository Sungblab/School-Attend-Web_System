import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ScrollView,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, SIZES } from "../theme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "../utils/axios";

export default function SignUpScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    password: "",
    confirmPassword: "",
    grade: "",
    class: "",
    number: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    try {
      // 입력값 검증
      if (!formData.studentId || !/^\d{4}$/.test(formData.studentId)) {
        Alert.alert("입력 오류", "학번은 4자리 숫자여야 합니다.");
        return;
      }

      if (!formData.name || !/^[가-힣]{2,4}$/.test(formData.name)) {
        Alert.alert("입력 오류", "이름은 2-4자의 한글이어야 합니다.");
        return;
      }

      if (formData.password.length < 8) {
        Alert.alert("입력 오류", "비밀번호는 8자 이상이어야 합니다.");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert("입력 오류", "비밀번호가 일치하지 않습니다.");
        return;
      }

      if (!formData.grade || !/^[1-3]$/.test(formData.grade)) {
        Alert.alert("입력 오류", "학년은 1-3 사이의 숫자여야 합니다.");
        return;
      }

      if (!formData.class || !/^[1-9]$/.test(formData.class)) {
        Alert.alert("입력 오류", "반은 1-9 사이의 숫자여야 합니다.");
        return;
      }

      if (!formData.number || !/^[1-9][0-9]?$/.test(formData.number)) {
        Alert.alert("입력 오류", "번호는 1-99 사이의 숫자여야 합니다.");
        return;
      }

      setLoading(true);
      await axios.post("/api/signup", {
        studentId: formData.studentId,
        name: formData.name,
        password: formData.password,
        grade: parseInt(formData.grade),
        class: parseInt(formData.class),
        number: parseInt(formData.number),
      });

      Alert.alert("회원가입 완료", "회원가입이 완료되었습니다.", [
        { text: "확인", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      Alert.alert(
        "회원가입 실패",
        error.response?.data?.message || "회원가입에 실패했습니다."
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
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.header}>
              <Icon name="account-plus" size={60} color={COLORS.primary} />
              <Text variant="headlineMedium" style={styles.title}>
                회원가입
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                학생 정보를 입력하여{"\n"}회원가입을 진행해주세요
              </Text>
            </View>

            <View style={styles.form}>
              <TextInput
                mode="outlined"
                label="학번"
                placeholder="학번 (4자리)"
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
                label="이름"
                placeholder="이름 (한글)"
                left={<TextInput.Icon icon="account" />}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                style={styles.input}
                theme={{
                  roundness: 12,
                }}
              />

              <TextInput
                mode="outlined"
                label="비밀번호"
                placeholder="비밀번호 (8자 이상)"
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

              <TextInput
                mode="outlined"
                label="비밀번호 확인"
                placeholder="비밀번호 확인"
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                theme={{
                  roundness: 12,
                }}
              />

              <View style={styles.row}>
                <TextInput
                  mode="outlined"
                  label="학년"
                  placeholder="학년"
                  left={<TextInput.Icon icon="school" />}
                  value={formData.grade}
                  onChangeText={(text) =>
                    setFormData({ ...formData, grade: text })
                  }
                  keyboardType="numeric"
                  maxLength={1}
                  style={[styles.input, styles.smallInput]}
                  theme={{
                    roundness: 12,
                  }}
                />

                <TextInput
                  mode="outlined"
                  label="반"
                  placeholder="반"
                  value={formData.class}
                  onChangeText={(text) =>
                    setFormData({ ...formData, class: text })
                  }
                  keyboardType="numeric"
                  maxLength={1}
                  style={[styles.input, styles.smallInput]}
                  theme={{
                    roundness: 12,
                  }}
                />

                <TextInput
                  mode="outlined"
                  label="번호"
                  placeholder="번호"
                  value={formData.number}
                  onChangeText={(text) =>
                    setFormData({ ...formData, number: text })
                  }
                  keyboardType="numeric"
                  maxLength={2}
                  style={[styles.input, styles.smallInput]}
                  theme={{
                    roundness: 12,
                  }}
                />
              </View>

              <Button
                mode="contained"
                onPress={handleSignUp}
                loading={loading}
                disabled={loading}
                style={styles.button}
                labelStyle={styles.buttonText}
              >
                {loading ? "가입 중..." : "회원가입"}
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.goBack()}
                icon="arrow-left"
                labelStyle={styles.linkText}
              >
                로그인 화면으로 돌아가기
              </Button>
            </View>
          </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    padding: wp("5%"),
  },
  header: {
    alignItems: "center",
    marginTop: hp("3%"),
    marginBottom: hp("3%"),
  },
  title: {
    fontFamily: FONTS.koreanBold,
    color: COLORS.text,
    marginTop: hp("2%"),
  },
  subtitle: {
    fontFamily: FONTS.korean,
    color: COLORS.text,
    textAlign: "center",
    marginTop: hp("1%"),
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: hp("2%"),
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("2%"),
  },
  smallInput: {
    flex: 1,
    marginHorizontal: wp("1%"),
  },
  button: {
    marginTop: hp("2%"),
    marginBottom: hp("2%"),
    paddingVertical: hp("0.5%"),
    borderRadius: 12,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontFamily: FONTS.koreanBold,
    fontSize: SIZES.md,
  },
  linkText: {
    fontFamily: FONTS.koreanMedium,
    fontSize: SIZES.md,
    color: COLORS.primary,
  },
});
