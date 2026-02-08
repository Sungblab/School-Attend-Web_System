import { DefaultTheme } from "@react-navigation/native";

export const COLORS = {
  primary: "#2563EB",
  background: "#FFFFFF",
  text: "#1F2937",
  border: "#E5E7EB",
  error: "#DC2626",
};

export const FONTS = {
  korean: "Pretendard-Regular",
  koreanMedium: "Pretendard-Medium",
  koreanBold: "Pretendard-Bold",
};

export const SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    text: COLORS.text,
    border: COLORS.border,
    card: COLORS.background,
  },
};
