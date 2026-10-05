# 動畫與互動

最後核對：2026-10-06

## 動態原則

- 整體應安靜、柔和、稍慢，像連續流動而不是 PPT。
- 優先使用原地透明度、細微位移與柔光；避免大幅 3D 翻頁、硬切、快速彈跳與大量元素同時移動。
- 動畫結束後的幾何位置必須穩定，不能靠動畫 transform 補救版面。
- 所有長動畫都要能被切頁、狀態更新或 reduced-motion 安全終止。

## 現有時序

| 功能 | 時序 |
| --- | --- |
| 頁面離場 | 180ms，淡出並上移 6px |
| 頁面進場 | 320ms，從下方 8px 淡入 |
| 作品舊圖淡出 | 700ms |
| 作品舊文案淡出 | 140ms |
| 作品新文案淡入 | 延遲 140ms，持續 420ms |
| 背景換色 | CSS 0.8s |
| 小環葉片旋轉 | CSS 980ms |
| 完成一輪光暈 | 900ms |
| 選單面板開／關 | 650ms |
| 選單項目進場 | 800ms；延遲 150–750ms |
| 節氣名稱淡入 | 760ms |
| 節氣敘述開始 | 延遲 420ms |
| 節氣敘述逐字 | 每字 96ms |
| 開場淡出 | 1100ms |
| 音樂淡入 | 1800ms，至 0.22 |

## 狀態鎖與取消

- 頁面：`isPageSwitching` 阻止重複切換，`try/finally` 取消 Web Animations 並恢復焦點。
- 輪播：`isAnimating` 阻止連點；`turnVersion` 辨識過期動畫；`finishPageTurn()` 取消並重建唯一狀態。
- 節氣：`solarPreviewVersion`、`solarTypingTimer`、`solarHoverTimer` 防止快速滑動產生殘字。
- 音樂：`musicRequest` 使舊播放 promise／淡入 frame 不再更新目前狀態。
- 理時序裝飾：使用單一 `requestAnimationFrame` 與 280ms rest timer，不建立持續追蹤迴圈。

修改相關功能時，不可移除上述保護而只改視覺動畫。

## 全域按鈕回饋

- 捕獲階段 click handler 對一般按鈕播放 220ms 的 `scale: 0.97 → 1`。
- `#enterExhibition` 排除在外，避免破壞距離回應。
- 箭頭本身用 `transform: translateY(-50%)` 定位，因此按壓回饋使用獨立 `scale` 動畫，避免覆蓋位置。

## 開場距離回應

- 指標距入口 320px 內，經 smoothstep 曲線換算 `--proximity`。
- 接近時反應 450ms，遠離時 850ms；只縮放文字與調光，不移動實際按鈕 hit area。
- 鍵盤 Tab 模式與指標模式分開；焦點可提供完整可見回饋。
- 觸控不追蹤距離。

## reduced-motion

- JavaScript 切頁、輪播與節氣逐字效果改為立即完成。
- CSS 停用選單、按鈕、節氣環、完成光暈、開場霧、理時序裝飾等主要 transition／animation。
- 模式在執行中變更時，輪播與理時序裝飾會立即清理。

## 修改檢查

- 快速連點、快速 hover、切頁途中不留下殘影、舊文字或錯誤 z-index。
- 動畫取消後 ARIA、`inert`、active class 與畫面一致。
- 不用 transform 同時負責版面定位與多組動畫。
- 瀏覽器不支援 Web Animations 時仍有正確最終畫面。
- reduced-motion 不只是停動畫，也要保留完整功能。

## 更新此文件的時機

修改任何動畫時間、緩動、狀態鎖、取消流程、距離／hover 回應或 reduced-motion 行為時更新。
