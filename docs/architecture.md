# 專案架構

最後核對：2026-10-06

## 技術型態

- 無框架、無 bundler、無套件管理器的靜態網站。
- `index.html` 提供全部頁面結構與內容。
- `style.css` 負責全站版面、視覺、斷點與 CSS 動畫。
- `script.js` 負責狀態、DOM 增強、Web Animations、選單、切頁、輪播、節氣預覽、開場、音樂與滑鼠回應。
- `images/` 與 `fonts/` 為本機素材；沒有外部 CDN 字體依賴。

## DOM 層級

```text
body
├─ #entrance (dialog，開場)
├─ #backgroundMusic
├─ .site-header
├─ #siteMenu (dialog，導覽)
└─ main
   ├─ #intro-page
   ├─ #gallery-page
   ├─ #text-page
   ├─ #planning-page
   └─ #thanks-page
```

所有 `.page-content` 同時存在 DOM；只有 `.active` 頁顯示。沒有路由、網址 hash 或瀏覽器歷史狀態。

## 載入與初始狀態

1. `<html>` 一開始帶有 `entrance-pending`，CSS 暫時隱藏 header 與 main。
2. HTML 預設 `#intro-page` 為 `.active`。
3. JavaScript 建立輪播／節氣／背景裝飾狀態，呼叫 `entrance.showModal()`。
4. 下一個 animation frame 移除 `entrance-pending`，顯示開場而不閃出下層頁面。
5. 使用者按「入新章」後，開場淡出並關閉，理時序成為可見主頁。

## 核心狀態

| 狀態 | 用途 |
| --- | --- |
| `isPageSwitching` | 阻止頁面轉場期間重複切頁 |
| `currentIndex` | 目前作品索引，0–23 |
| `isAnimating` | 阻止作品轉場期間連續換圖 |
| `turnAnimations` / `turnVersion` | 取消舊動畫並避免過期完成處理 |
| `cycleRotation` | 作品頁右上小環葉片的累積角度 |
| `solarPreviewVersion` / timers | 防止節氣預覽的舊文字計時器回寫 |
| `enteringExhibition` | 防止重複關閉開場 |
| `musicRequest` / `wantsMusic` | 管理播放請求與淡入取消 |

## 必須同步的 24 筆資料

下列四組資料以相同索引互相對應：

1. HTML 的 24 個 `.solar-term`。
2. HTML 的 24 個 `.slide-item`。
3. JavaScript 的 24 筆 `solarTermNotes`。
4. JavaScript 的 24 筆 `backgroundColors`。

作品頁右上節氣名稱是 JavaScript 依相同索引從 `.solar-term` 複製。任何增刪、排序或名稱修改都必須一起核對。

## 樣式狀態類別

- `html.entrance-pending`：開場 script 尚未完成初始化。
- `html/body.entrance-open`：開場 modal 開啟、鎖定捲動。
- `body.menu-open`：選單開啟、鎖定背景捲動。
- `body.intro-page-active`：理時序專用背景。
- `body.text-page-active`：目前只供繪春信與謝花人使用的資訊頁背景。
- `.page-content.active`：目前頁面。
- `.slide-item.is-current` / `.is-turning`：目前作品與正離場作品。
- `.solar-cycle.is-previewing` / `.has-preview`：節氣跟隨與中央文字狀態。
- `body.cycle-complete`：第 24 張正向回到第 1 張的短暫完成光暈。

## 技術決策

- 目前不導入 Tailwind；高度客製 CSS 與動畫是主要樣式系統。
- 不加入作品快速跳轉；觀看順序由上一張／下一張與滑動控制。
- 不用畫框、襯紙或強烈整頁擦拭效果。
- 若未來重構，應先建立視覺與互動回歸基準，再分階段進行；不要一次替換現有 class 或動畫架構。

## 更新此文件的時機

新增檔案、頁面、全域狀態、資料來源、建置流程或跨檔資料關係時更新。單一 CSS 微調不需要更新。
