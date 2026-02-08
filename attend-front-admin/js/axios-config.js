// axios 기본 설정
axios.defaults.baseURL =
  "https://port-0-attend-backend-m0tl39wtc3a73922.sel4.cloudtype.app";

// 토큰 만료 확인 함수
function checkTokenExpiration() {
  try {
    const token = localStorage.getItem("token");
    const keepLoggedIn = localStorage.getItem("keepLoggedIn") === "true";
    if (!token) return;

    // 토큰 디코딩
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiresIn = payload.exp * 1000;
    const currentTime = Date.now();

    // 토큰이 만료된 경우
    if (currentTime >= expiresIn) {
      localStorage.clear();
      window.location.href =
        "index.html?error=" + 
        encodeURIComponent("세션이 만료되었습니다. 다시 로그인해주세요.");
    }
  } catch (error) {
    console.error("Error checking token expiration:", error);
  }
}

// 페이지 로드 시 로그인 상태 체크
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
    checkTokenExpiration();
  }
});

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // 토큰이 만료된 경우(401)
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href =
        "index.html?error=" +
        encodeURIComponent("세션이 만료되었습니다. 다시 로그인해주세요.");
    }
    return Promise.reject(error);
  }
);
