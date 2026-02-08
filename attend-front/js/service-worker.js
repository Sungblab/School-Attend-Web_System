// 캐시 이름 설정
const CACHE_NAME = "attend-front-v1";

// 캐시할 파일 목록
const urlsToCache = [
  "/",
  "/index.html",
  "/hub.html",
  "/qr.html",
  "/signup.html",
  "/find-password.html",
  "/change-password.html",
  "/css/output.css",
  "/js/axios-config.js",
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  "https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css",
  "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js",
];

// 서비스 워커 설치 및 캐시 파일 저장
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("캐시 생성 완료");
      return cache.addAll(urlsToCache);
    })
  );
});

// 네트워크 요청 가로채기 및 캐시된 응답 반환
self.addEventListener("fetch", (event) => {
  // API 요청은 캐싱하지 않음
  if (event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // 캐시에 있으면 캐시된 응답 반환
      if (response) {
        return response;
      }

      // 캐시에 없으면 네트워크 요청
      return fetch(event.request)
        .then((response) => {
          // 유효한 응답이 아니면 그대로 반환
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // 응답을 복제하여 캐시에 저장
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // 오프라인이고 HTML 요청인 경우 오프라인 페이지 반환
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/index.html");
          }
        });
    })
  );
});

// 서비스 워커 활성화 및 이전 캐시 삭제
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
