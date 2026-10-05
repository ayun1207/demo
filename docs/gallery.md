# 作品輪播

最後核對：2026-10-06

## 核心原則

- 共 24 張作品，以前後順序逐張觀看並首尾相接。
- 作品是主體；不用畫框、襯紙、相框陰影或快速跳轉索引。
- 桌機一般為圖片加右側文案，手機為圖片在上、文案在下。
- 左右箭頭需保持清楚、可點擊、可聚焦；手機另支援水平滑動。

## DOM 與初始化

- `#gallery-page` 包含兩個 `.arrow-btn` 與 `.carousel-viewport`。
- 24 個 `<figure class="slide-item">` 疊在同一 CSS grid area。
- JavaScript 以 `originalSlides` 保存 DOM 順序；`finishPageTurn()` 設定唯一 `.is-current`，其他項目為 `aria-hidden=true` 且 `inert=true`。
- 每張 `.caption-label` 在初始化時獲得 `.cycle-orbit`、`.cycle-marker` 與對應 `.caption-term`。

## 一般直式版面

- `.carousel-viewport` 寬 92%，最大 1440px。
- `.slide-item` 桌機欄寬比例為 `1.85fr / 1fr`，右欄至少 280px。
- `.slide-image` 高度為 `min(78vh, 900px)`，圖片使用 `object-fit: contain`。
- 文案最大寬 390px，右側對齊。

## 橫式特例

只有第 9、15、22 張帶 `.slide-item-landscape`：

- 桌機欄寬比例約 `2.5fr / 0.72fr`，圖片最高 `min(72vh, 760px)`，文案最大 330px。
- 第 15 張另帶 `.slide-item-landscape-featured`，欄寬約 `2.68fr / 0.7fr`，圖片最高 `min(74vh, 790px)`。
- 768px 以下以完整 16:9 寬幅顯示，文案接在下方。
- 手機箭頭透過 `:has(.slide-item-landscape.is-current)` 對準橫圖中心。

不要把橫式 class 套到其他作品，也不要為調整這三張而改動一般作品規則。

## 換圖流程

- `moveSlide(direction)` 只接受 `1` 或 `-1`，且只在作品頁 active、沒有動畫時執行。
- 新圖先完整放在下層；舊圖 700ms 淡出，避免兩張同時透明造成白閃。
- 舊文案 140ms 淡出；新文案延遲 140ms、用 420ms 淡入，不做位移。
- `turnVersion` 與 `turnAnimations` 支援取消；切頁時 `finishPageTurn()` 強制整理最終狀態。
- 背景色依 `backgroundColors[currentIndex]` 同步更新，CSS 以 0.8 秒過渡。

## 右上節氣與循環標記

- 目前可見內容為：節氣名稱、50px 小環及兩位數作品編號；舊文件所述的「第 XX 幅 · 共二十四幅」並未存在於目前 DOM。
- 小環有 24 刻度、四段季節色與葉片指針。
- 每切換一張，`--cycle-angle` 累積正負 15 度。
- 正向從第 24 張回到第 1 張時，`cycle-complete` 觸發 900ms 光暈；反向跨越不觸發。

## 手勢與操作

- 左右箭頭直接呼叫 `moveSlide(-1/1)`。
- 手機滑動門檻為 50px，且水平距離必須大於垂直距離。
- `isAnimating` 防止快速點擊造成多層轉場。
- reduced-motion 下立即完成換圖與狀態更新。

## 圖片與文案現況

- 已存在：1、2、9、15、22；其餘 19 張路徑已寫入但檔案缺少。
- 9、15、22 是橫式；其餘版面目前按直式設計。
- 24 個標題、敘述及 `alt` 皆仍是暫時內容。
- 具體尺寸與素材清單見 `content-assets.md`。

## 修改檢查

- 24 張數量、順序與節氣／短句／背景色一致。
- 第一張往前與第 24 張往後皆可循環。
- 快速點擊、切頁途中、reduced-motion 下都只留下唯一 current slide。
- 第 10、11、12 等雙位數不造成右上資訊跳動。
- 桌機直式、桌機橫式、手機直式與手機橫式都不裁切主體。
- 新圖檔名與副檔名必須和 HTML 完全一致。

## 更新此文件的時機

修改作品數量／順序、版面、橫式特例、換圖流程、箭頭、滑動、右上標記或作品文案結構時更新。
