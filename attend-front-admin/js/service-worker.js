// 캐시 이름 설정
const CACHE_NAME = "attend-front-v2";
const STATIC_CACHE = `${CACHE_NAME}-static`;
const CDN_CACHE = `${CACHE_NAME}-cdn`;

// 캐시할 정적 파일 목록
const staticResources = [
  "/",
  "/index.html",
  "/hub.html",
  "/signup.html",
  "/dashboard.html",
  "/statistic-dashboard.html",
  "/find-password.html",
  "/change-password.html",
  "/css/output.css",
  "/js/axios-config.js",
];

// 캐시할 CDN 파일 목록
const cdnResources = [
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  "https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css",
  "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js",
];

// 서비스 워커 설치 및 캐시 파일 저장
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      // 정적 리소스 캐싱
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("정적 캐시 생성 완료");
        return Promise.allSettled(
          staticResources.map((url) =>
            cache.add(url).catch((error) => {
              console.warn(`정적 리소스 캐싱 실패: ${url}`, error);
              return null;
            })
          )
        );
      }),

      // CDN 리소스 캐싱
      caches.open(CDN_CACHE).then((cache) => {
        console.log("CDN 캐시 생성 완료");
        return Promise.allSettled(
          cdnResources.map((url) =>
            fetch(url, { mode: "no-cors" })
              .then((response) => {
                if (response) {
                  return cache.put(url, response);
                }
              })
              .catch((error) => {
                console.warn(`CDN 리소스 캐싱 실패: ${url}`, error);
                return null;
              })
          )
        );
      }),
    ]).catch((error) => {
      console.error("캐시 초기화 중 오류 발생:", error);
    })
  );

  // 즉시 활성화
  self.skipWaiting();
});

// 네트워크 요청 가로채기 및 캐시된 응답 반환
self.addEventListener("fetch", (event) => {
  // API 요청은 캐싱하지 않음
  if (event.request.url.includes("/api/")) {
    return;
  }

  // CDN 리소스인지 확인
  const isCDNResource = cdnResources.some((url) =>
    event.request.url.includes(url)
  );
  const cacheToCheck = isCDNResource ? CDN_CACHE : STATIC_CACHE;

  event.respondWith(
    // 적절한 캐시에서 리소스 확인
    caches
      .open(cacheToCheck)
      .then((cache) => cache.match(event.request))
      .then((cachedResponse) => {
        // 캐시된 응답이 없으면 다른 캐시도 확인
        if (!cachedResponse) {
          return caches.match(event.request);
        }
        return cachedResponse;
      })
      .then((cachedResponse) => {
        // 모든 캐시에서 응답이 없으면 네트워크 요청
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // 유효한 응답이면 적절한 캐시에 저장
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              const targetCache = isCDNResource ? CDN_CACHE : STATIC_CACHE;

              caches
                .open(targetCache)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                })
                .catch((err) => console.warn("캐시 업데이트 실패:", err));
            }
            return networkResponse;
          })
          .catch((error) => {
            console.warn("네트워크 요청 실패:", error);
            return null;
          });

        // 캐시된 응답이 있으면 반환하고, 백그라운드에서 업데이트
        if (cachedResponse) {
          // 백그라운드에서 새로운 데이터 가져오기 시도
          fetchPromise;
          return cachedResponse;
        }

        // 캐시된 응답이 없으면 네트워크 요청 결과 반환
        return fetchPromise.then((response) => {
          if (response) return response;

          // 네트워크 요청이 실패하고 HTML을 요청한 경우
          const accept = event.request.headers.get("accept");
          if (accept && accept.includes("text/html")) {
            return caches.match("/index.html");
          }

          throw new Error("리소스를 로드할 수 없습니다.");
        });
      })
      .catch((error) => {
        console.error("서비스 워커 fetch 핸들러 오류:", error);
        // 최후의 수단으로 오프라인 페이지 제공
        const accept = event.request.headers.get("accept");
        if (accept && accept.includes("text/html")) {
          return caches.match("/index.html");
        }
      })
  );
});

// 서비스 워커 활성화 및 이전 캐시 삭제
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [STATIC_CACHE, CDN_CACHE];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName.startsWith(CACHE_NAME.split("-")[0]) &&
              !cacheWhitelist.includes(cacheName)
            ) {
              console.log(`삭제된 캐시: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("서비스 워커가 활성화되었습니다.");
        return self.clients.claim();
      })
  );
});
