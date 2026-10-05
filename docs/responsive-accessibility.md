# 響應式與無障礙

最後核對：2026-10-06

## 主要斷點

| 條件 | 主要變化 |
| --- | --- |
| 769–1100px | 理時序兩欄縮窄，節氣環最大約 450px |
| 769–900px | 理時序改為單欄並允許垂直捲動 |
| 768px 以下 | 理時序單欄；作品改上下排列；作品頁允許垂直捲動 |
| 600px 以下 | 開場四季元素縮放／移位；理時序動態裝飾隱藏偶數項 |
| `prefers-reduced-motion: reduce` | 停用主要位移、逐字、呼吸、霧與互動動畫 |

## 高度單位

- 開場同時提供 `100vh` 與 `100dvh`。
- 手機一般作品圖片同時提供 `60vh` 與 `60svh`，後者覆蓋前者。
- 不要只留下新 viewport 單位；保留前一行作舊瀏覽器回退。

## 手機版

- 理時序與作品頁皆可垂直捲動；不要以全域 overflow 阻止內容到達。
- 理時序強制 `<br>` 在 768px 以下隱藏，引文自然換行。
- 一般作品圖高 60svh；橫式 9、15、22 以 16:9 寬幅顯示。
- 作品文案最大 440px，靠右對齊於內容寬度內。
- 箭頭至少 44×44px；一般作品對準 60svh 中心，橫式作品對準橫幅中心。
- 觸控滑動只在水平位移超過 50px 且大於垂直位移時換圖。

## Dialog 與焦點

- 開場與選單都使用原生 `dialog`／`showModal()`。
- 開場以 `aria-labelledby`、`aria-describedby` 指向標題與副標。
- 選單以 `aria-labelledby="menuTitle"` 宣告，但目前 HTML 中沒有 `id="menuTitle"` 元素；這是需後續處理的語意缺口。
- 選單關閉後焦點回 `#menuToggle`，且同步 `aria-expanded=false`。
- 開場關閉後焦點也回選單按鈕。
- Esc 在選單關閉選單；在開場則以靜音方式進入，而不是直接讓 dialog 消失。

## 目前 ARIA 與互動狀態

- 選單按鈕有 `aria-controls`、`aria-expanded`；目前頁的 nav button 有 `aria-current="page"`。
- 左右箭頭有 `aria-label`、`title`，SVG 為 `aria-hidden` 且不可聚焦。
- 非目前作品設為 `aria-hidden=true` 及 `inert=true`。
- 裝飾層大多為 `aria-hidden` 或由 JavaScript 設定 `inert`，且不接收 pointer events。
- 節氣環整體有 `aria-label`，但個別節氣目前是不可聚焦的 `<span>`，只有 pointer hover 預覽。
- 圖片 `alt` 目前仍是暫時文字，正式上線前必須補寫。

## 焦點樣式

- 選單、導覽、箭頭、入口與音樂控制皆有 `:focus-visible` 規則。
- 不要以 `outline: none` 移除焦點而不提供替代；開場按鈕目前由子文字的光影提供 focus-visible 回饋。

## 修改檢查

- 320px 左右窄寬、一般手機、平板與大桌面皆能看到完整主要內容。
- 鍵盤可開關選單、切頁與操作箭頭；焦點不進入隱藏作品。
- 使用 Esc、遮罩與關閉鈕後 class、ARIA 與焦點皆正確。
- 觸控上下捲動不誤觸換圖。
- reduced-motion 下沒有被延遲動畫卡住的功能。

## 更新此文件的時機

修改斷點、viewport 單位、手機版面、觸控手勢、dialog、焦點、ARIA、`inert` 或 reduced-motion 時更新。
