import React, { useState } from "react";
import { View, StyleSheet, Modal, Alert } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Portal,
  Dialog,
  IconButton,
} from "react-native-paper";
import { COLORS, FONTS, SIZES } from "../theme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "../utils/axios";

export default function ChangePasswordModal({ visible, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    try {
      // 입력값 검증
      if (!formData.currentPassword) {
        Alert.alert("입력 오류", "현재 비밀번호를 입력해주세요.");
        return;
      }
      if (formData.newPassword.length < 8) {
        Alert.alert("입력 오류", "새 비밀번호는 8자 이상이어야 합니다.");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        Alert.alert("입력 오류", "새 비밀번호가 일치하지 않습니다.");
        return;
      }

      setLoading(true);
      await axios.post("/api/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      Alert.alert("성공", "비밀번호가 변경되었습니다.", [
        { text: "확인", onPress: handleClose },
      ]);
    } catch (error) {
      Alert.alert(
        "오류",
        error.response?.data?.message || "비밀번호 변경에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    onClose();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
        <Dialog.Title style={styles.title}>비밀번호 변경</Dialog.Title>
        <Dialog.Content>
          <TextInput
            mode="outlined"
            label="현재 비밀번호"
            placeholder="현재 비밀번호"
            secureTextEntry={!showCurrentPassword}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showCurrentPassword ? "eye-off" : "eye"}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              />
            }
            value={formData.currentPassword}
            onChangeText={(text) =>
              setFormData({ ...formData, currentPassword: text })
            }
            style={styles.input}
            theme={{ roundness: 12 }}
          />

          <TextInput
            mode="outlined"
            label="새 비밀번호"
            placeholder="새 비밀번호 (8자 이상)"
            secureTextEntry={!showNewPassword}
            left={<TextInput.Icon icon="lock-plus" />}
            right={
              <TextInput.Icon
                icon={showNewPassword ? "eye-off" : "eye"}
                onPress={() => setShowNewPassword(!showNewPassword)}
              />
            }
            value={formData.newPassword}
            onChangeText={(text) =>
              setFormData({ ...formData, newPassword: text })
            }
            style={styles.input}
            theme={{ roundness: 12 }}
          />

          <TextInput
            mode="outlined"
            label="새 비밀번호 확인"
            placeholder="새 비밀번호 확인"
            secureTextEntry={!showConfirmPassword}
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
            style={styles.input}
            theme={{ roundness: 12 }}
          />
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleClose}
            style={styles.cancelButton}
            labelStyle={styles.cancelButtonText}
          >
            취소
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}
          >
            {loading ? "변경 중..." : "변경"}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginHorizontal: wp("5%"),
  },
  title: {
    fontFamily: FONTS.koreanBold,
    color: COLORS.text,
    textAlign: "center",
    fontSize: SIZES.lg,
  },
  input: {
    marginBottom: hp("2%"),
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  actions: {
    paddingHorizontal: wp("3%"),
    paddingBottom: hp("2%"),
  },
  cancelButton: {
    borderColor: COLORS.primary,
    borderRadius: 12,
    flex: 1,
    marginRight: wp("2%"),
  },
  submitButton: {
    borderRadius: 12,
    flex: 1,
    marginLeft: wp("2%"),
  },
  cancelButtonText: {
    fontFamily: FONTS.koreanMedium,
    color: COLORS.primary,
    fontSize: SIZES.sm,
  },
  submitButtonText: {
    fontFamily: FONTS.koreanMedium,
    color: "#fff",
    fontSize: SIZES.sm,
  },
});
