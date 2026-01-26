const CACHE_NAME = 'fittrack-v1';
// 캐싱할 파일 목록
const urlsToCache = [
  './index.html',
  './style.css',
  './router.js',
  './dashboard.js',
  './workout.js',
  './nutrition.js',
  './history.js',
  './graphs.js',
  './management.js',
  './icon.png',
  './manifest.json'
];

// 설치 시 캐시 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// 데이터 요청 시 캐시 우선 사용 (속도 향상의 핵심)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
