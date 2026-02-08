import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Text, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, SIZES } from "../theme";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import QRCode from "react-native-qrcode-svg";
import { useAuth } from "../contexts/AuthContext";
import axios from "../utils/axios";
import moment from "moment";
import "moment/locale/ko";

moment.locale("ko");

export default function HomeScreen() {
  const { user } = useAuth();
  const [qrData, setQrData] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // QR 코드 데이터 가져오기
  const fetchQrData = async () => {
    try {
      // 현재 시간을 ISO 문자열로 변환
      const currentTime = new Date().toISOString();
      
      const response = await axios.post("/api/generate-qr", {
        studentId: user?.studentId,
        timestamp: currentTime // 현재 시간을 문자열로 전송
      });
      if (response.data.success) {
        setQrData(response.data.encryptedData);
      }
    } catch (error) {
      console.error("QR 데이터 가져오기 실패:", error);
      Alert.alert("오류", "QR 코드를 가져오는데 실패했습니다.");
    }
  };

  // 출석 상태 가져오기
  const fetchAttendanceStatus = async () => {
    try {
      const response = await axios.get(
        `/api/attendance/student/${user?.studentId}`
      );
      if (response.data.success && response.data.todayStatus) {
        setAttendanceStatus(response.data.todayStatus.status);
      }
    } catch (error) {
      console.error("출석 상태 가져오기 실패:", error);
    }
  };

  // 새로고침 처리
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchQrData(), fetchAttendanceStatus()]);
    setRefreshing(false);
  };

  // 초기 데이터 로드 및 주기적 업데이트
  useEffect(() => {
    onRefresh();
    const qrInterval = setInterval(fetchQrData, 30000);
    return () => clearInterval(qrInterval);
  }, []);

  // 출석 상태에 따른 스타일과 텍스트
  const getStatusInfo = (status) => {
    switch (status) {
      case "present":
        return {
          container: styles.statusPresent,
          text: "출석",
          icon: "check-circle",
          color: "#059669",
        };
      case "late":
        return {
          container: styles.statusLate,
          text: "지각",
          icon: "alert-circle",
          color: "#D97706",
        };
      case "absent":
        return {
          container: styles.statusAbsent,
          text: "결석",
          icon: "close-circle",
          color: "#DC2626",
        };
      default:
        return {
          container: styles.statusNone,
          text: "미출석",
          icon: "help-circle",
          color: "#6B7280",
        };
    }
  };

  const statusInfo = getStatusInfo(attendanceStatus);

  // 출결 기록 가져오기
  const fetchAttendanceRecords = async () => {
    try {
      const response = await axios.get(
        `/api/attendance/student/${user?.studentId}`
      );
      if (response.data.success) {
        // 통계 데이터 처리
        const records = [];
        if (
          response.data.attendances &&
          typeof response.data.attendances === "object"
        ) {
          Object.entries(response.data.attendances).forEach(
            ([month, monthAttendances]) => {
              if (Array.isArray(monthAttendances)) {
                records.push(...monthAttendances);
              }
            }
          );
        }
        // 날짜 기준으로 정렬
        const sortedRecords = records.sort(
          (a, b) => moment(b.date).valueOf() - moment(a.date).valueOf()
        );
        setAttendanceRecords(sortedRecords);
      }
    } catch (error) {
      console.error("출결 기록 가져오기 실패:", error);
      Alert.alert("오류", "출결 기록을 가져오는데 실패했습니다.");
    }
  };

  // 출결 상태 텍스트 변환
  const getStatusText = (status) => {
    switch (status) {
      case "present":
        return "출석";
      case "late":
        return "지각";
      case "absent":
        return "결석";
      case "excused":
        return "인정결석";
      default:
        return "미출석";
    }
  };

  // 출결 상태 색상 변환
  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "#059669";
      case "late":
        return "#D97706";
      case "absent":
        return "#DC2626";
      case "excused":
        return "#6366F1";
      default:
        return "#6B7280";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <Surface style={styles.qrContainer} elevation={1}>
          <Text variant="headlineMedium" style={styles.greeting}>
            {user?.name}님, 안녕하세요!
          </Text>

          {qrData ? (
            <>
              <QRCode
                value={qrData}
                size={wp("60%")}
                color={COLORS.text}
                backgroundColor={COLORS.background}
              />
              <Text style={styles.qrInfo}>
                학번: {user?.studentId} | 이름: {user?.name}
              </Text>
              <Text style={styles.qrNotice}>
                이 QR 코드는 30초마다 갱신됩니다.
              </Text>
            </>
          ) : (
            <View style={styles.qrPlaceholder}>
              <Icon name="qrcode" size={wp("35%")} color={COLORS.border} />
              <Text variant="bodyLarge" style={styles.qrPlaceholderText}>
                QR 코드 로딩 중...
              </Text>
            </View>
          )}
        </Surface>

        <Surface style={styles.statusContainer} elevation={1}>
          <Text style={styles.statusTitle}>오늘의 출석 상태</Text>
          <View style={[styles.statusCard, statusInfo.container]}>
            <Icon name={statusInfo.icon} size={16} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={() => {
              fetchAttendanceRecords();
              setShowRecordModal(true);
            }}
          >
            <Text style={styles.recordButtonText}>출결 기록 보기</Text>
            <Icon name="chevron-right" size={16} color={COLORS.grey} />
          </TouchableOpacity>
        </Surface>
      </View>

      <Modal
        visible={showRecordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRecordModal(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowRecordModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>출결 기록</Text>
              <TouchableOpacity
                onPress={() => setShowRecordModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.recordList}>
              {attendanceRecords.map((record, index) => (
                <View key={index} style={styles.recordItem}>
                  <View style={styles.recordDate}>
                    <Text style={styles.recordDateText}>
                      {moment(record.date).format("YYYY-MM-DD")}
                    </Text>
                    <Text style={styles.recordDayText}>
                      {moment(record.date).format("(ddd)")}
                    </Text>
                  </View>
                  <View style={styles.recordInfo}>
                    <View
                      style={[
                        styles.recordStatus,
                        {
                          backgroundColor: getStatusColor(record.status) + "15",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.recordStatusText,
                          {
                            color: getStatusColor(record.status),
                          },
                        ]}
                      >
                        {getStatusText(record.status)}
                      </Text>
                    </View>
                    {record.lateMinutes > 0 && (
                      <Text style={styles.lateText}>
                        {record.lateMinutes}분 지각
                      </Text>
                    )}
                    {record.isExcused && (
                      <View style={styles.excusedBadge}>
                        <Text style={styles.excusedText}>인정출결</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
              {attendanceRecords.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>출결 기록이 없습니다.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContainer: {
    flex: 1,
    padding: wp("7%"),
    marginTop: hp("5%"),
    justifyContent: "center",
  },
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: wp("5%"),
    borderRadius: 15,
    marginBottom: hp("3%"),
  },
  greeting: {
    fontFamily: FONTS.koreanBold,
    color: COLORS.text,
    fontSize: SIZES.xl * 1.2,
    marginBottom: hp("3%"),
    textAlign: "center",
    width: "100%",
  },
  qrInfo: {
    fontFamily: FONTS.korean,
    fontSize: SIZES.md,
    color: COLORS.grey,
    marginTop: hp("2%"),
  },
  qrNotice: {
    fontFamily: FONTS.korean,
    fontSize: SIZES.md,
    color: COLORS.primary,
    marginTop: hp("1%"),
  },
  qrPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    height: wp("70%"),
  },
  qrPlaceholderText: {
    fontFamily: FONTS.korean,
    fontSize: SIZES.lg,
    color: COLORS.text,
    marginTop: hp("2%"),
  },
  statusContainer: {
    backgroundColor: "#fff",
    padding: wp("4%"),
    borderRadius: 15,
    marginBottom: hp("3%"),
  },
  statusTitle: {
    fontFamily: FONTS.koreanBold,
    fontSize: SIZES.md,
    color: COLORS.grey,
    marginBottom: hp("1.5%"),
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("0.5%"),
    paddingHorizontal: wp("3%"),
    borderRadius: 6,
  },
  statusPresent: {
    backgroundColor: "#DEF7EC",
  },
  statusLate: {
    backgroundColor: "#FEF3C7",
  },
  statusAbsent: {
    backgroundColor: "#FEE2E2",
  },
  statusNone: {
    backgroundColor: "#F3F4F6",
  },
  statusText: {
    fontFamily: FONTS.koreanBold,
    fontSize: SIZES.sm,
    marginLeft: wp("1%"),
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp("1.5%"),
    marginTop: hp("2%"),
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  recordButtonText: {
    fontFamily: FONTS.koreanBold,
    fontSize: SIZES.md,
    color: COLORS.grey,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    maxHeight: hp("70%"),
    width: "90%",
    alignSelf: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp("5%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontFamily: FONTS.koreanBold,
    fontSize: SIZES.xl,
    color: COLORS.text,
  },
  recordList: {
    padding: wp("5%"),
  },
  recordItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp("1.5%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  recordDate: {
    flexDirection: "row",
    alignItems: "center",
  },
  recordDateText: {
    fontFamily: FONTS.korean,
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  recordDayText: {
    fontFamily: FONTS.korean,
    fontSize: SIZES.md,
    color: COLORS.grey,
    marginLeft: wp("1%"),
  },
  recordStatus: {
    paddingVertical: hp("0.5%"),
    paddingHorizontal: wp("3%"),
    borderRadius: 6,
  },
  recordStatusText: {
    fontFamily: FONTS.koreanBold,
    fontSize: SIZES.sm,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("10%"),
  },
  emptyText: {
    fontFamily: FONTS.korean,
    fontSize: SIZES.md,
    color: COLORS.grey,
  },
  recordInfo: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
  },
  lateText: {
    fontFamily: FONTS.korean,
    fontSize: SIZES.sm,
    color: COLORS.warning,
  },
  excusedBadge: {
    backgroundColor: "#818CF850",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  excusedText: {
    fontFamily: FONTS.koreanBold,
    fontSize: SIZES.sm,
    color: "#6366F1",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  closeModalButton: {
    backgroundColor: COLORS.primary,
    padding: hp("1.5%"),
    borderRadius: 12,
    marginTop: hp("2%"),
    alignItems: "center",
  },
  closeModalButtonText: {
    color: "#fff",
    fontFamily: FONTS.koreanBold,
    fontSize: SIZES.md,
  },
});
