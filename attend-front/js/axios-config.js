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
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("keepLoggedIn");
      window.location.href =
        "index.html?error=" + 
        encodeURIComponent("세션이 만료되었습니다. 다시 로그인해주세요.");
    }
  } catch (error) {
    console.error("Error checking token expiration:", error);
    // 토큰 파싱 오류가 발생했지만 로그인 페이지에서는 리다이렉트 하지 않음
    if (!window.location.pathname.includes('index.html')) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("keepLoggedIn");
      window.location.href =
        "index.html?error=" + 
        encodeURIComponent("세션 처리 중 오류가 발생했습니다. 다시 로그인해주세요.");
    }
  }
}

// 페이지 로드 시 로그인 상태 체크
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
    // 현재 페이지가 로그인 페이지가 아닌 경우에만 토큰 체크 실행
    if (!window.location.pathname.includes('index.html')) {
      // 약간의 지연 후 토큰 체크 실행 (로그인 후 토큰이 제대로 저장되도록)
      setTimeout(() => {
        checkTokenExpiration();
      }, 500);
    }
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
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("keepLoggedIn");
      window.location.href =
        "index.html?error=" +
        encodeURIComponent("세션이 만료되었습니다. 다시 로그인해주세요.");
    }
    return Promise.reject(error);
  }
);
