// 서비스 워커 지원 여부 확인 및 등록
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/js/service-worker.js")
      .then((registration) => {})
      .catch((error) => {
        console.error("서비스 워커 등록 실패:", error);
      });
  });
}

// PWA 설치 이벤트 처리
let deferredPrompt;

// 페이지 로드 후 설치 버튼 초기화
window.addEventListener("load", () => {
  const installButton = document.getElementById("install-pwa");

  // 설치 버튼이 있는 경우에만 이벤트 리스너 추가
  if (installButton) {
    // 초기에는 설치 버튼 숨기기
    installButton.style.display = "none";

    // 이미 설치되었는지 확인
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      console.log("이미 앱이 설치되어 있습니다.");
      return; // 이미 설치된 경우 종료
    }
  }
});

// beforeinstallprompt 이벤트는 window에 직접 연결
window.addEventListener("beforeinstallprompt", (e) => {
  // 이벤트 저장 (preventDefault 호출하지 않음)
  deferredPrompt = e;

  const installButton = document.getElementById("install-pwa");
  if (installButton) {
    // 설치 버튼 표시
    installButton.style.display = "flex";

    // 기존 이벤트 리스너 제거 (중복 방지)
    installButton.replaceWith(installButton.cloneNode(true));
    const newInstallButton = document.getElementById("install-pwa");

    // 설치 버튼 클릭 이벤트
    newInstallButton.addEventListener("click", () => {
      console.log("설치 버튼 클릭됨");

      // 설치 버튼 숨기기
      newInstallButton.style.display = "none";

      // 설치 프롬프트 표시
      deferredPrompt.prompt();

      // 사용자 응답 확인
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("사용자가 PWA 설치를 수락했습니다.");
        } else {
          console.log("사용자가 PWA 설치를 거부했습니다.");
          // 거부한 경우 버튼 다시 표시
          newInstallButton.style.display = "flex";
        }
        // deferredPrompt 초기화
        deferredPrompt = null;
      });
    });
  }
});

// 앱이 설치된 경우 이벤트 처리
window.addEventListener("appinstalled", (e) => {
  console.log("앱이 설치되었습니다.");
  // 설치 버튼 숨기기
  const installButton = document.getElementById("install-pwa");
  if (installButton) {
    installButton.style.display = "none";
  }
});
