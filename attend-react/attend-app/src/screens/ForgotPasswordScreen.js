import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Linking,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, SIZES } from "../theme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function ForgotPasswordScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState("");

  const handleContactAdmin = async () => {
    if (!studentId) {
      Alert.alert("입력 오류", "학번을 입력해주세요.");
      return;
    }

    if (!/^\d{4}$/.test(studentId)) {
      Alert.alert("입력 오류", "올바른 학번 형식이 아닙니다.");
      return;
    }

    setLoading(true);

    try {
      const adminEmail = "sungblab@gmail.com";
      const subject = "고등학교 출결관리 시스템 비밀번호 초기화 요청";
      const body = `안녕하세요,\n\n학번 ${studentId}의 비밀번호 초기화를 요청드립니다.\n\n`;

      const url = `mailto:${adminEmail}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        Alert.alert(
          "이메일 전송",
          "이메일 앱이 열립니다. 관리자에게 문의 메일을 작성해주세요."
        );
      } else {
        Alert.alert(
          "오류",
          `이메일 앱을 열 수 없습니다.\n관리자 이메일: ${adminEmail}`
        );
      }
    } catch (error) {
      Alert.alert("오류", "이메일 앱을 여는 중 오류가 발생했습니다.");
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
              <Icon name="lock-question" size={60} color={COLORS.primary} />
              <Text variant="headlineMedium" style={styles.title}>
                비밀번호 찾기
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                비밀번호를 잊으셨나요?{"\n"}
                관리자에게 문의하여 초기화할 수 있습니다.
              </Text>
            </View>

            <View style={styles.form}>
              <TextInput
                mode="outlined"
                label="학번"
                placeholder="학번 (4자리)"
                left={<TextInput.Icon icon="card-account-details" />}
                value={studentId}
                onChangeText={setStudentId}
                keyboardType="numeric"
                maxLength={4}
                style={styles.input}
                theme={{
                  roundness: 12,
                }}
              />

              <Button
                mode="contained"
                onPress={handleContactAdmin}
                loading={loading}
                disabled={loading}
                icon="email-send"
                style={styles.button}
                labelStyle={styles.buttonText}
              >
                {loading ? "처리중..." : "관리자에게 문의하기"}
              </Button>
            </View>

            <View style={styles.footer}>
              <Button
                mode="text"
                onPress={() => navigation.goBack()}
                icon="arrow-left"
                labelStyle={styles.linkText}
              >
                로그인 화면으로 돌아가기
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
    padding: wp("7%"),
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: hp("8%"),
  },
  title: {
    fontFamily: FONTS.koreanBold,
    color: COLORS.text,
    marginTop: hp("2%"),
    marginBottom: hp("1%"),
  },
  subtitle: {
    fontFamily: FONTS.korean,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: hp("3%"),
  },
  form: {
    width: "100%",
    marginBottom: hp("5%"),
  },
  input: {
    marginBottom: hp("2%"),
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  button: {
    marginTop: hp("3%"),
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
    paddingVertical: 2,
  },
  footer: {
    alignItems: "center",
    marginTop: hp("4%"),
  },
  linkText: {
    fontFamily: FONTS.koreanMedium,
    fontSize: SIZES.md,
    color: COLORS.primary,
  },
});
