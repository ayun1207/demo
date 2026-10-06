# 專案架構

最後核對：2026-10-06

## 技術型態

- 無框架、無 bundler、無套件管理器的靜態網站。
- `index.html` 提供全部章節結構與內容；`style.css` 負責版面、斷點及 CSS 動畫；`script.js` 負責選單、捲動狀態、節氣預覽、開場、音樂與滑鼠回應。
- `images/` 與 `fonts/` 為本機素材，沒有外部 CDN 字體依賴。

## DOM 與閱讀順序

```text
body
├─ #entrance (dialog，開場)
├─ #backgroundMusic
├─ .site-header (桌機左側資訊軌／窄螢幕上方橫條)
├─ #siteMenu (dialog，章節導覽)
└─ main
   ├─ #intro-page
   ├─ #gallery-page
   │  └─ .gallery-sticky-shell
   │     ├─ .gallery-section-heading
   │     └─ .gallery-stage（箭頭、進度環、24 × .slide-item）
   ├─ #text-page
   ├─ #planning-page
   └─ #thanks-page
```

五個 `.page-content` 都在正常文件流中並同時顯示。`.active` 只標示目前閱讀章節，不再用來切換 `display`。網站沒有路由、網址 hash 或瀏覽器歷史狀態。

## 載入與初始狀態

1. `<html>` 起始帶 `entrance-pending`，避免 dialog 初始化前閃出主內容。
2. JavaScript 初始化節氣環、作品閱讀進度與理時序裝飾，接著 `entrance.showModal()`。
3. 使用者按「入新章」後關閉開場，從理時序開始正常垂直瀏覽。
4. 捲動時 `requestAnimationFrame` 節流的 `updateScrollState()` 同步目前章節；`updateGalleryFromScroll()` 在黏著展廳內同步作品索引。

## 核心狀態

| 狀態 | 用途 |
| --- | --- |
| `currentSection` | 目前位於閱讀線上的章節 |
| `currentIndex` | 橫向展廳目前作品索引，0–23 |
| `isAnimating` / `turnVersion` | 防止重複換作與過期動畫完成處理 |
| `cycleRotation` | 保存循環累積角度，讓 24→1 延續到 360 度 |
| `scrollFrame` | 合併連續 scroll／resize 更新 |
| `lastGalleryScrollIndex` | 避免同一捲動區間重複觸發相同作品 |
| `solarPreviewVersion` / timers | 防止節氣預覽的舊文字計時器回寫 |
| `enteringExhibition` | 防止重複關閉開場 |
| `musicRequest` / `wantsMusic` | 管理播放請求與淡入取消 |

舊的整頁切換函式仍暫留在 `script.js` 作相容保護，但目前 HTML 不再呼叫；作品輪播函式則是現行展廳的核心互動。

## 必須同步的 24 筆資料

下列四組資料以相同索引互相對應：

1. HTML 的 24 個 `.solar-term`。
2. HTML 的 24 個 `.slide-item`。
3. JavaScript 的 24 筆 `solarTermNotes`。
4. JavaScript 的 24 筆 `backgroundColors`。

作品進度名稱直接取自各 `.slide-item h2`。任何增刪、排序或名稱修改仍須一起核對四組資料。

## 主要狀態類別

- `html.entrance-pending`、`html/body.entrance-open`：開場初始化與捲動鎖定。
- `body.menu-open`：選單開啟時鎖定背景。
- `body.intro-page-active`、`body.gallery-section-active`、`body.text-page-active`：目前章節的背景／進度 UI。
- `.page-content.active`：目前閱讀章節。
- `.slide-item.is-current` / `.is-turning`：目前作品與正離場作品；其他作品為 `aria-hidden` 且 `inert`。
- `body.cycle-complete`：正向從第 24 件回到第 1 件的短暫完成狀態。
- `.solar-cycle.is-previewing` / `.has-preview`：理時序節氣預覽狀態。

## 技術決策

- 不導入 Tailwind 或其他框架。
- 網站章節採垂直長頁，不使用強制 scroll snap 或滿版切頁；作品區是有明確邊界的橫向循環展廳。
- `main` 提供全頁共用的編輯網格與縱向欄線；理時序、作品章名與資訊章節共用內容寬度，讓章節在長頁上維持連續對齊。
- 理時序使用偏心雙欄並縮短首章高度；三個資訊章節使用章節序號、欄線與交錯標題，不以置中卡片作為預設模板。
- 動畫不負責版面定位；內容本身須在動畫停用時仍完整可讀。
- 不加入作品快速跳轉、畫框、襯紙或強烈整頁擦拭效果。

## 更新此文件的時機

新增檔案、章節、全域狀態、資料來源、建置流程或跨檔資料關係時更新。
