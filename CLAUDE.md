# Fit-Track Pro (PT 운동 기록부)

개인용 운동·식단 기록 PWA. GitHub Pages로 배포.

- 배포 주소: https://leoato.github.io/PT_record/
- 저장소: https://github.com/leoato/PT_record (branch: `main`)
- 배포 방식: `main`에 push → GitHub Pages가 자동 반영 (별도 빌드 없음)

## 절대 규칙

1. **단일 `index.html` 구조.** 별도 JS/CSS 파일을 만들지 않는다. 모든 코드는 `index.html` 안에 둔다.
2. **요청받은 부분만 수정.** 기존 기능·코드는 요청 없이 변경·삭제하지 않는다.
3. **모든 데이터는 `localStorage`.** 새 키를 추가하면 `getBackupData()`의 `keys` 배열에도 반드시 추가한다 (백업 누락 방지).
   - **예외: 밥 사진 보관함만 IndexedDB를 쓴다.** 사진은 장당 수백KB라 localStorage 5MB 한도를 넘겨 운동 기록 저장까지 실패시킬 수 있다. 백업 대상이 아니며 `MEAL_KEEP_DAYS`(오늘 포함 3일)가 지나면 자동 삭제된다. 사진 외의 데이터는 계속 localStorage에 둔다.
   - **사진 자동 삭제 기간을 줄이지 말 것.** 처음에 "날짜가 바뀌면 삭제"로 만들었다가 자정 직후 아직 PT쌤한테 못 보낸 사진이 통째로 날아간 사고가 있었다. `purgeOldMealPhotos()`는 앱을 열 때마다 실행되고 IndexedDB 삭제는 되돌릴 수 없다. 기간을 건드릴 일이 있으면 반드시 사용자에게 먼저 확인한다.
4. **Gemini 호출은 기존 함수 재사용.** `callGeminiWithFallback()`, `resizeImageToBase64()`가 이미 있다. 새로 작성하지 않는다. API 키는 `localStorage('gemini_api_key')`에 저장돼 있다.
5. **코드 수정 후 `sw.js`의 `CACHE_NAME` 버전을 올린다** (`fittrack-vNN` → `vNN+1`). 안 올리면 사용자 기기에 옛 버전이 계속 캐시된다.
6. **GitHub 업로드는 반드시 git push 또는 파일 업로드 UI로.** 웹에서 복사-붙여넣기 하면 파일이 잘려 앱이 크래시한 이력이 있다 (index.html이 3,300줄/177KB로 큼).

## 파일 구조

```
index.html      3,318줄 — 앱 전체 (HTML + CSS + JS 인라인)
sw.js           서비스 워커. 네트워크 우선 → 실패 시 캐시
manifest.json   PWA 매니페스트
icon*.png       아이콘 4종 (icon.png는 원본 소스, 실제 포맷은 JPEG)
```

## index.html 코드 맵 (줄 번호는 수정하면 밀림 — 함수명으로 검색할 것)

| 영역 | 위치 | 주요 함수 |
|---|---|---|
| CSS / 테마 | ~17–490 | `applyTheme()`, `loadTheme()` |
| 데이터 헬퍼 | ~494–590 | `getData()` `saveData()` `getLib()` `getHistory()` `getPresets()` `calc1RM()` `getPR()` `calcStreak()` `getDayProteinTotal()` `showToast()` |
| 대시보드·달력 | ~660–1020 | `renderDashboard()` `renderCalendar()` `renderDaySummary()` `renderPPLAdvisor()` |
| 운동 기록 | ~1024–1250 | `renderWorkout()` `saveWork()` |
| 코스 | ~1249–1490 | `renderCourse()`, `COURSE_DATA` |
| 히스토리 | ~1491–1560 | `renderHistory()` |
| 그래프 | ~1558–1836 | `renderGraphs()` `renderBodyGraphs()` `renderBig3()` `renderExerciseGraphs()` |
| 설정·백업 | ~1837–1992 | `renderManagement()` **`getBackupData()`** `updateBackupTime()` |
| 다이어트/루틴 상수 | ~1993–2070 | `DIET_PLAN` `ROUTINE_TYPES` `WEEK_ROUTINE` `FIXED_CARDIO` `getWeekRoutineMap()` |
| 헬스장별 루틴 | ~2067–2115 | `getGymData()` `saveGymData()` **`getGymRoutine()`** |
| 단백질 | ~2116–2360 | `renderProteinCard()` `getProteinPresets()` `renderDietRules()` |
| Gemini 사진 분석 | ~2355–2470 | `resizeImageToBase64()` `callGeminiWithFallback()` `renderPhotoResult()`, `GEMINI_MODELS` |
| 밥 사진 보관함 (IndexedDB) | ~2475–2615 | `mealDB()` `addMealPhoto()` `getMealPhotos()` `deleteMealPhoto()` `markMealPhotosSent()` `purgeOldMealPhotos()` `renderMealPhotoCard()` `stashMealPhoto()` `shareMealPhotos()` |
| 저울 사진 → 몸무게 인식 | ~2617–2700 | `handleWeightPhoto()` `renderWeightPhotoSheet()` `saveWeightFromPhoto()` |
| 루틴 탭 / 헬스장 선택 | ~2473–2680 | `renderRoutine()` `renderGymChipBar()` `renderGymSelectScreen()` `renderTodayRoutine()` |
| 세션 타이머 | ~2676–2870 | `renderSessionCard()` `updateSessionUI()` `autoStopStaleSessions()` `commitFixedCardioLog()` |
| 주간 계획·시간표 | ~2876–2957 | `renderWeekPlan()` `renderTimetable()` |
| 헬스장 머신 관리 | ~2958–3185 | `renderMachineManager()` `renderOverridesList()` `renderMachineConfirm()` `renderMachineRecommend()` `addMachineToGym()` |
| 휴식 타이머 | ~3186–3310 | `updateRestUI()` `finishRestTimer()` `playChime()` `notifyRestDone()` |

## localStorage 키 전체 목록

백업 대상 (`getBackupData()`에 포함됨):
`fit_data` `workout_lib` `workout_history` `food_presets` `workout_schedule` `gym_data` `week_routine_map`

백업 대상 아님 (설정값 — 의도적 제외):
`app_theme` `gemini_api_key` `gemini_model_pref` `last_backup_time` `rules_open` `use_sys_timer` `sys_timer_shortcut_name`

## 작업 흐름

```bash
# 1. 최신 상태 확인
git pull

# 2. index.html 수정

# 3. 로컬 확인 (PWA/서비스워커 때문에 file:// 말고 서버로 열 것)
python -m http.server 8000    # → http://localhost:8000

# 4. sw.js의 CACHE_NAME 버전 올리기

# 5. 배포
git add -A && git commit -m "작업 내용" && git push
```

배포 후 폰에서 최신 버전이 안 보이면: PWA를 완전히 종료 후 재실행하거나, 사파리에서 새로고침.

## 사진 공유 (navigator.share)

- **문구 없이 사진만 보낸다.** `navigator.share({files})`만 호출하고 `title`/`text`를 붙이지 않는다 (사용자 요청). 천국의 계단 인증사진(`shareCardioPhoto`), 밥 사진(`shareMealPhotos`), 저울 사진(`saveWeightFromPhoto`) 모두 해당.

**사진 3종의 전송 방식이 다르다 — 헷갈리지 말 것:**

| 사진 | 저장 | 전송 시점 |
|---|---|---|
| 밥 사진 | IndexedDB에 하루 종일 보관 | 밤에 모아서 한 번에 |
| 공복 몸무게(저울) | 저장 안 함 (숫자만 `fit_data`에) | 찍은 자리에서 바로 |
| 천국의 계단 | 저장 안 함 | 찍은 자리에서 바로 |
- **`navigator.share`는 사용자가 버튼을 탭한 순간 동기적으로 호출해야 한다.** 앞에 `await`가 끼면 iOS Safari가 "user gesture 없음"으로 거부한다. 그래서 밥 사진은 카드를 그릴 때 미리 `window._mealShareFiles`에 `File[]`을 만들어두고, 버튼 핸들러는 그걸 그대로 넘긴다. 이 구조를 바꾸지 말 것.
- 데스크톱 브라우저는 파일 공유를 대부분 지원하지 않아 `navigator.canShare({files})`가 `false`다. 정상이며, 이때는 안내 문구로 대체된다. 실제 동작은 iOS 홈화면 PWA에서 확인해야 한다.

## 주의

- **PWA를 홈 화면에서 삭제하기 전 반드시 localStorage 데이터를 백업할 것** (설정 탭 → 백업). 삭제하면 데이터가 전부 사라진다.
- iOS(WebKit)에서 History 탭 크래시 이력이 있었다. 재발하면 index.html 파일 무결성(잘림)부터 확인.
- `C:\Users\leoat\Documents\Claude\Projects\PT 운동 기록부\` 폴더에도 같은 이름의 자산 사본이 있으나 **그쪽은 코드 저장소가 아니다.** 코드 수정은 항상 이 저장소에서 한다.
